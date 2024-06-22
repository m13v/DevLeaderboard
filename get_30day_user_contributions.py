import requests
import sys
from datetime import datetime, timedelta

def get_contributions_last_30_days(username, token):
    query = """
    query($userName: String!, $fromDate: DateTime!) {
      user(login: $userName) {
        contributionsCollection(from: $fromDate) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
    """
    headers = {
        'Authorization': f'bearer {token}',
        'Content-Type': 'application/json'
    }
    from_date = (datetime.now() - timedelta(days=30)).isoformat()
    variables = {
        "userName": username,
        "fromDate": from_date
    }
    response = requests.post('https://api.github.com/graphql', json={'query': query, 'variables': variables}, headers=headers)
    if response.status_code == 200:
        data = response.json()['data']['user']['contributionsCollection']
        total_contributions = data['contributionCalendar']['totalContributions']
        commit_contributions = data['totalCommitContributions']
        issue_contributions = data['totalIssueContributions']
        pr_contributions = data['totalPullRequestContributions']
        review_contributions = data['totalPullRequestReviewContributions']
        
        print(f"Total contributions in the last 30 days for {username}: {total_contributions}")
        print(f"Commits: {commit_contributions}, Issues: {issue_contributions}, PRs: {pr_contributions}, Reviews: {review_contributions}")
        return {
            "total": total_contributions,
            "commits": commit_contributions,
            "issues": issue_contributions,
            "prs": pr_contributions,
            "reviews": review_contributions
        }
    else:
        print(f"Failed to fetch contributions: {response.status_code} {response.reason}")
        print(response.text)
        return None

def main():
    if len(sys.argv) != 3:
        print("Usage: python get_30day_user_contributions.py <username> <token>")
        sys.exit(1)
    username = sys.argv[1]
    token = sys.argv[2]
    get_contributions_last_30_days(username, token)

if __name__ == "__main__":
    main()
