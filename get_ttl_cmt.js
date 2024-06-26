require('dotenv').config();
const axios = require('axios');

async function getTotalContributionsInRange(username, fromDate, toDate) {
    const token = process.env.GITHUB_TOKEN;
    const query = `
    query($userName: String!, $fromDate: DateTime!, $toDate: DateTime!) {
      user(login: $userName) {
        contributionsCollection(from: $fromDate, to: $toDate) {
          contributionCalendar {
            totalContributions
          }
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
    console.log(`Fetching total contributions for username: ${username} from ${fromDate.toISOString()} to ${toDate.toISOString()}`); // Add this log
    try {
        const response = await axios.post('https://api.github.com/graphql', {
            query,
            variables
        }, { headers });
        console.log('GitHub API response:', response.data); // Add this log
        if (response.status === 200) {
            if (response.data.data.user && response.data.data.user.contributionsCollection && response.data.data.user.contributionsCollection.contributionCalendar) {
                const contributions = response.data.data.user.contributionsCollection.contributionCalendar;
                return contributions.totalContributions;
            } else {
                console.error('Contributions data is null or undefined:', response.data.data.user);
                return null;
            }
        } else {
            console.error(`Failed to fetch total contributions: ${response.status} ${response.statusText}`);
            console.error(response.data);
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

async function getTotalContributions(username, joined) {
    if (username.includes('[bot]')) {
        console.error("Skipping bot account:", username);
        return null;
    }

    const registrationDate = new Date(joined);
    if (!registrationDate) {
        console.error("Invalid registration date.");
        return null;
    }

    let currentDate = new Date();
    let totalContributions = 0;

    while (currentDate > registrationDate) {
        const fromDate = new Date(currentDate);
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        if (fromDate < registrationDate) {
            fromDate.setTime(registrationDate.getTime());
        }
        const contributions = await getTotalContributionsInRange(username, fromDate, currentDate);
        if (contributions !== null) {
            totalContributions += contributions;
            console.log(`Contributions from ${fromDate.toISOString()} to ${currentDate.toISOString()}: ${contributions}`);
        }
        currentDate = fromDate;
    }

    console.log(`Total contributions since registration for ${username}: ${totalContributions}`);
    return totalContributions;
}

module.exports = { getTotalContributions };
