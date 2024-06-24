const axios = require('axios');
require('dotenv').config();

async function getCommitDetails(commitUrl) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GITHUB_TOKEN environment variable not set");
    }

    const headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`
    };

    try {
        const response = await axios.get(commitUrl, { headers });
        const commitData = response.data;
        // console.log('Commit Data:', JSON.stringify(commitData, null, 2)); // Pretty print the JSON
        return commitData;
    } catch (error) {
        console.error('Error fetching commit details:', error);
        throw error;
    }
}

module.exports = { getCommitDetails };

// If you want to run this script directly, uncomment the following lines:
// const commitUrl = "https://api.github.com/repos/matthew-heartful/DevLeaderboard/commits/dd0d56a2888efa8c51fb9a97fe495b3d7d102254";
// getCommitDetails(commitUrl).then(data => console.log(data)).catch(err => console.error(err));