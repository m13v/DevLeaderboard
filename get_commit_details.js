const axios = require('axios');
require('dotenv').config();

async function getCommitDetails(commitUrl) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GITHUB_TOKEN environment variable not set");
    }

    const headers = {
        "Accept": "application/vnd.github.v3+json", // Updated to match curl request
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
            if (error.response && error.response.status === 403) {
                if (error.response.data.message.includes('API rate limit exceeded')) {
                    console.warn('Rate limit exceeded. Sleeping for 60 minutes...');
                    await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000)); // Sleep for 60 minutes
                } else if (attempt < maxRetries) {
                    console.warn(`Rate limit exceeded. Retrying in ${retryDelay(attempt)}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay(attempt)));
                }
            } else {
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    if (error.response.status === 404) {
                        console.error('Commit not found:', commitUrl);
                        throw new Error('Commit not found');
                    }
                } else if (error.request) {
                    console.error('Error request:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                if (error.response && error.response.status === 429) {
                    return { error: 'rate_limit_exceeded', retryAfter: retryDelay(attempt) };
                }
                break;
            }
        }
    }
    throw new Error('Failed to fetch commit details after multiple attempts');
}

module.exports = { getCommitDetails };

// If you want to run this script directly, uncomment the following lines:
// const commitUrl = "https://api.github.com/repos/jitsecurity-soss/langchain/commits/295b9b704b668f39f0417d27757e32201385566c";
// getCommitDetails(commitUrl).then(data => console.log(data)).catch(err => console.error(err));