require('dotenv').config();
const axios = require('axios');

async function getUserRegistrationDate(username) {
    const token = process.env.GITHUB_TOKEN;
    const query = `
    query($userName: String!) {
      user(login: $userName) {
        createdAt
      }
    }
    `;
    const headers = {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const variables = { userName: username };
    console.log(`Fetching registration date for username: ${username}`); // Add this log
    try {
        const response = await axios.post('https://api.github.com/graphql', {
            query,
            variables
        }, { headers });
        console.log('GitHub API response:', response.data); // Add this log
        if (response.status === 200) {
            if (response.data.data.user) {
                return new Date(response.data.data.user.createdAt);
            } else {
                console.error('User data is null or undefined:', response.data.data.user);
                return null;
            }
        } else {
            console.error(`Failed to fetch registration date: ${response.status} ${response.statusText}`);
            console.error(response.data);
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

async function getTotalCommitsInRange(username, fromDate, toDate) {
    const token = process.env.GITHUB_TOKEN;
    const query = `
    query($userName: String!, $fromDate: DateTime!, $toDate: DateTime!) {
      user(login: $userName) {
        contributionsCollection(from: $fromDate, to: $toDate) {
          totalCommitContributions
        }
      }
    }
    `;
    const headers = {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const variables = {
        userName: username,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
    };
    console.log(`Fetching total commits for username: ${username} from ${fromDate.toISOString()} to ${toDate.toISOString()}`); // Add this log
    try {
        const response = await axios.post('https://api.github.com/graphql', {
            query,
            variables
        }, { headers });
        console.log('GitHub API response:', response.data); // Add this log
        if (response.status === 200) {
            if (response.data.data.user && response.data.data.user.contributionsCollection) {
                return response.data.data.user.contributionsCollection.totalCommitContributions;
            } else {
                console.error('Contributions data is null or undefined:', response.data.data.user);
                return null;
            }
        } else {
            console.error(`Failed to fetch total commits: ${response.status} ${response.statusText}`);
            console.error(response.data);
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

async function getTotalCommits(username) {
    const registrationDate = await getUserRegistrationDate(username);
    if (!registrationDate) {
        console.error("Failed to fetch registration date.");
        return null;
    }

    let currentDate = new Date();
    let totalCommits = 0;

    while (currentDate > registrationDate) {
        const fromDate = new Date(currentDate);
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        if (fromDate < registrationDate) {
            fromDate.setTime(registrationDate.getTime());
        }
        const commits = await getTotalCommitsInRange(username, fromDate, currentDate);
        if (commits !== null) {
            totalCommits += commits;
            console.log(`Commits from ${fromDate.toISOString()} to ${currentDate.toISOString()}: ${commits}`);
        }
        currentDate = fromDate;
    }

    console.log(`Total commits since registration for ${username}: ${totalCommits}`);
    return totalCommits;
}

module.exports = { getTotalCommits };