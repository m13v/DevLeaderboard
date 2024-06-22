import os
import requests
from dotenv import load_dotenv

def get_commit_details(owner, repo, ref, token):
    # GitHub API URL
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{ref}"

    # Headers
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}"
    }

    # Make the request
    response = requests.get(url, headers=headers)
    commit_data = response.json()
    print(commit_data)  # Add this line

    # Print additions and deletions
    for file in commit_data.get('files', []):
        filename = file.get('filename')
        patch = file.get('patch')
        print(f"File: {filename}")
        print(patch)
        print("-" * 40)

def main():
    load_dotenv()  # Load environment variables from .env file
    github_token = os.getenv('GITHUB_TOKEN')
    if not github_token:
        raise ValueError("GITHUB_TOKEN environment variable not set")

    # Replace with your values
    owner = "matthew-heartful"
    repo = "DevLeaderboard"
    ref = "ce4dd10b89676e7cf448b807b3e25e236edaf292"
    get_commit_details(owner, repo, ref, github_token)

if __name__ == "__main__":
    main()
