import requests
import sys

def get_contributors(repo_url, token):
    headers = {
        'Authorization': f'token {token}'
    }
    repo_parts = repo_url.rstrip('/').split('/')
    api_url = f'https://api.github.com/repos/{repo_parts[-2]}/{repo_parts[-1].replace(".git", "")}/contributors'
    response = requests.get(api_url, headers=headers)
    
    if response.status_code == 401:
        print("Failed to fetch contributors: 401 Unauthorized")
        return
    elif response.status_code == 404:
        print("Failed to fetch contributors: 404 Not Found")
        return
    
    contributors = []
    page = 1

    while True:
        response = requests.get(api_url, headers=headers, params={"per_page": 100, "page": page})
        if response.status_code != 200:
            print(f"Failed to fetch contributors: {response.status_code}")
            break

        data = response.json()
        if not data:
            break

        contributors.extend(data)
        page += 1

    return contributors


if __name__ == "__main__":
    repo_url = sys.argv[1]
    token = sys.argv[2]
    contributors = get_contributors(repo_url, token)
    for contributor in contributors:
        print(f"{contributor['login']}: {contributor['contributions']} contributions")