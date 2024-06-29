const axios = require('axios');
require('dotenv').config();

async function getCommitDetails(commitUrl) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error("GITHUB_TOKEN environment variable not set");
    }

    const headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "axios/1.7.2"
    };

    const retryDelay = 20 * 60 * 1000; // 20 minutes
    const timeout = 1200000; // 1 hour in milliseconds

    while (true) {
        try {
            const response = await axios.get(commitUrl, { headers, timeout });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 403) {
                if (error.response.data.message.includes('API rate limit exceeded')) {
                    console.warn('Rate limit exceeded. Sleeping for 20 minutes...');
                    await new Promise(resolve => setTimeout(resolve, retryDelay)); // Sleep for 20 minutes
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
                    return { error: 'rate_limit_exceeded', retryAfter: retryDelay };
                }
                if (error.response && error.response.status === 422) {
                    console.error(`Error processing commit ${commitUrl}. Error: ${error.message}`);
                    return 'DELETE_COMMIT'; // Return a specific value to indicate the commit should be deleted
                } else {
                    console.error(`Error processing commit ${commitUrl}:`, error);
                    throw error; // Re-throw the error for other cases
                }
                break;
            }
        }
    }
}

module.exports = { getCommitDetails };

// If you want to run this script directly, uncomment the following lines:
// const commitUrl = "https://api.github.com/repos/jitsecurity-soss/langchain/commits/295b9b704b668f39f0417d27757e32201385566c";
// getCommitDetails(commitUrl).then(data => console.log(data)).catch(err => console.error(err));