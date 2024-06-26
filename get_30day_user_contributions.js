require('dotenv').config();
const axios = require('axios');
const { getTotalContributions } = require('./get_ttl_cmt');
const { insertUserData, getUserByGithubLink } = require('./db_users_data.js');

async function query(username) {
    const token = process.env.GITHUB_TOKEN;
    const query = `
    query($userName: String!, $fromDate: DateTime!, $toDate: DateTime!) {
      user(login: $userName) {
        login
        name
        bio
        url
        avatarUrl
        company
        location
        email
        websiteUrl
        twitterUsername
        createdAt
        followers {
          totalCount
        }
        following {
          totalCount
        }
        contributionsCollection(from: $fromDate, to: $toDate) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
          }
          commitContributionsByRepository {
            repository {
              name
            }
            contributions(first: 10) {
              nodes {
                commitCount
              }
            }
          }
        }
        repositories {
          totalCount
        }
        gists(first: 10) {
          nodes {
            name
            description
            url
            files {
              name
              language {
                name
              }
            }
          }
        }
        organizations(first: 10) {
          nodes {
            name
            url
          }
        }
        starredRepositories(first: 10) {
          nodes {
            name
            owner {
              login
            }
            stargazerCount
          }
        }
      }
    }`;
    const headers = {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = new Date().toISOString();
    const variables = {
        userName: username,
        fromDate: fromDate,
        toDate: toDate
    };
    try {
        const response = await axios.post('https://api.github.com/graphql', {
            query,
            variables
        }, { headers });

        if (response.status === 200) {
            const user = response.data.data?.user;
            if (!user) {
                console.error('User not found in the response.');
                return null;
            }
            const contributions = user.contributionsCollection;
            const totalContributions = contributions.contributionCalendar.totalContributions;
            const commitContributions = contributions.totalCommitContributions;
            const issueContributions = contributions.totalIssueContributions;
            const prContributions = contributions.totalPullRequestContributions;
            const reviewContributions = contributions.totalPullRequestReviewContributions;

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
                email: user.email,
                name: user.name,
                bio: user.bio,
                twitterUsername: user.twitterUsername,
                websiteUrl: user.websiteUrl,
                rspjs2: response.data
            };
        } else {
            console.error(`Failed to fetch contributions: ${response.status} ${response.statusText}`);
            console.log('response.data=',response.data);
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

async function getContributionsLast30Days(username) {
    console.log(`getContributionsLast30Days(${username})`);

    // Get contributions for the last 30 days
    const contributions = await query(username);
    if (contributions === null) {
        console.error("Failed to fetch contributions for the last 30 days.");
        return null; // Return null to indicate failure
    }

    // Check if user data already exists
    const existingUser = await getUserByGithubLink(contributions.profileLink);
    let totalContributions;
    if (existingUser && existingUser.length > 0 && existingUser[0].total_contributions) {
        totalContributions = existingUser[0].total_contributions;
        console.log(`Total contributions already exist: ${totalContributions}`);
    } else {
        // Get total commits since registration
        totalContributions = await getTotalContributions(username, contributions.joined);
        if (totalContributions === null) {
            console.error("Failed to fetch total commits.");
            return null; // Return null to indicate failure
        }
    }

    // Prepare user data for insertion
    const userData = {
        avatar: contributions.avatar,
        followers: contributions.followers,
        github_link: contributions.profileLink,
        last_request: new Date().toISOString(),
        total_repo: contributions.totalRepositories,
        total_contributions: totalContributions,
        joined: contributions.joined,
        location: contributions.location,
        email: contributions.email,
        "30day_commits": contributions.commits,
        "30day_issues": contributions.issues,
        "30day_prs": contributions.prs,
        "30day_reviews": contributions.reviews,
        name: contributions.name,
        bio: contributions.bio,
        twitterUsername: contributions.twitterUsername,
        website: contributions.websiteUrl,
        rspjs2: contributions.rspjs2
    };

    // Remove null fields
    Object.keys(userData).forEach(key => {
        if (userData[key] === null) {
            delete userData[key];
        }
    });

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
