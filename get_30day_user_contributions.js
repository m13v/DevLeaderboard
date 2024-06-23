require('dotenv').config();
const axios = require('axios');
const { getTotalContributions } = require('./get_ttl_cmt');
const { insertUserData } = require('./db_users_data');

async function query(username) {
    const token = process.env.GITHUB_TOKEN;
    const query = `
    query($userName: String!, $fromDate: DateTime!, $registrationDate: DateTime!) {
      user(login: $userName) {
        avatarUrl
        followers {
          totalCount
        }
        url
        repositories {
          totalCount
        }
        contributionsCollection(from: $fromDate) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          contributionCalendar {
            totalContributions
          }
        }
        totalContributions: contributionsCollection(from: $registrationDate) {
          totalCommitContributions
        }
        createdAt
        location
        email
      }
    }
    `;
    const headers = {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const variables = {
        userName: username,
        fromDate: fromDate,
        registrationDate: new Date(0).toISOString() // Unix epoch start date
    };
    try {
        const response = await axios.post('https://api.github.com/graphql', {
            query,
            variables
        }, { headers });
        if (response.status === 200) {
            const user = response.data.data.user;
            const contributions = user.contributionsCollection;
            const totalContributions = contributions.contributionCalendar.totalContributions;
            const commitContributions = contributions.totalCommitContributions;
            const issueContributions = contributions.totalIssueContributions;
            const prContributions = contributions.totalPullRequestContributions;
            const reviewContributions = contributions.totalPullRequestReviewContributions;

            console.log(`Total contributions in the last 30 days for ${username}: ${totalContributions}`);
            console.log(`Commits: ${commitContributions}, Issues: ${issueContributions}, PRs: ${prContributions}, Reviews: ${reviewContributions}`);
            console.log(`Avatar: ${user.avatarUrl}`);
            console.log(`Followers: ${user.followers.totalCount}`);
            console.log(`Profile Link: ${user.url}`);
            console.log(`Total Repositories: ${user.repositories.totalCount}`);
            console.log(`Joined: ${user.createdAt}`);
            console.log(`Location: ${user.location}`);
            console.log(`Email: ${user.email}`);

            return {
                total: totalContributions,
                commits: commitContributions,
                issues: issueContributions,
                prs: prContributions,
                reviews: reviewContributions,
                avatar: user.avatarUrl,
                followers: user.followers.totalCount,
                profileLink: user.url,
                totalRepositories: user.repositories.totalCount,
                joined: user.createdAt,
                location: user.location,
                email: user.email
            };
        } else {
            console.error(`Failed to fetch contributions: ${response.status} ${response.statusText}`);
            console.error(response.data);
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

async function getContributionsLast30Days(username) {
    console.log(`getContributionsLast30Days(${username})`);

    // Get total commits since registration
    const totalCommits = await getTotalContributions(username);
    if (totalCommits === null) {
        console.error("Failed to fetch total commits.");
        return null; // Return null to indicate failure
    }

    // Get contributions for the last 30 days
    const contributions = await query(username);
    if (contributions === null) {
        console.error("Failed to fetch contributions for the last 30 days.");
        return null; // Return null to indicate failure
    }

    // Prepare user data for insertion
    const userData = {
        rank: 1, // Example rank, adjust as needed
        ranking_value: 100, // Example ranking value, adjust as needed
        avatar: contributions.avatar,
        followers: contributions.followers,
        github_link: contributions.profileLink,
        last_request: new Date().toISOString(),
        total_repo: contributions.totalRepositories,
        total_commits: totalCommits,
        joined: contributions.joined,
        location: contributions.location,
        email: contributions.email,
        "30day_commits": contributions.commits,
        "30day_issues": contributions.issues,
        "30day_prs": contributions.prs,
        "30day_reviews": contributions.reviews,
        stars_of_projects_committed_to: 200, // Example value, adjust as needed
        non_empty_non_comment_additions: 1000, // Example value, adjust as needed
        symbol_additions_excluding_comments: 500, // Example value, adjust as needed
        average_complexity_of_commits: 3 // Example value, adjust as needed
    };

    // Insert user data into the database
    try {
        await insertUserData(userData);
    } catch (error) {
        console.error('Error inserting/updating data:', error);
        return null; // Return null to indicate failure
    }

    return contributions; // Return contributions for further use
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.log("Usage: node get_30day_user_contributions.js <username>");
        process.exit(1);
    }
    const [username] = args;
    getContributionsLast30Days(username);
}

module.exports = { getContributionsLast30Days };
