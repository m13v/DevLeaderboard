const axios = require('axios');
require('dotenv').config();

async function getCommitDetails(commitUrl) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GITHUB_TOKEN environment variable not set");
    }

    const headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "axios/1.7.2"
    };

    const maxRetries = 3;
    const retryDelay = (retryCount) => Math.pow(2, retryCount) * 1000;
    const timeout = 3600000; // 1 hour in milliseconds

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.get(commitUrl, { headers, timeout });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 429 && attempt < maxRetries) {
                console.warn(`Rate limit exceeded. Retrying in ${retryDelay(attempt)}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay(attempt)));
            } else {
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    if (error.response.status === 404) {
                        console.error('Commit not found:', commitUrl);
                    }
                } else if (error.request) {
                    console.error('Error request:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                break;
            }
        }
    }
}

module.exports = { getCommitDetails };

// If you want to run this script directly, uncomment the following lines:
// const commitUrl = "https://api.github.com/repos/matthew-heartful/DevLeaderboard/commits/dd0d56a2888efa8c51fb9a97fe495b3d7d102254";
// getCommitDetails(commitUrl).then(data => console.log(data)).catch(err => console.error(err));
