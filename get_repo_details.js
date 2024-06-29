require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.GITHUB_TOKEN;

async function getRepoDetails(repoUrl) {
    const headers = { 
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github+json'
    };
    const retryDelay = 60 * 60 * 1000; // 60 minutes

    while (true) {
        try {
            const response = await axios.get(repoUrl, { headers });
            const repoData = response.data;

            // Fetch README file
            const readmeUrl = `${repoUrl}/readme`;
            try {
                const readmeResponse = await axios.get(readmeUrl, { headers });
                const readmeContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
                // Append README content to repoData
                repoData.readme = readmeContent;
            } catch (readmeError) {
                if (readmeError.response && readmeError.response.status === 404) {
                    console.log(`README not found for repository: ${repoUrl}`);
                } else {
                    console.error(`Error fetching README from ${repoUrl}: ${readmeError.message}`);
                }
            }

            return repoData;
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.error(`Rate limit hit for ${repoUrl}. Sleeping for 60 minutes...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay)); // Sleep for 60 minutes
            } else if (error.response) {
                if (error.response.status === 404) {
                    console.error(`Repository not found: ${repoUrl}`);
                } else {
                    console.error(`Error fetching repo details from ${repoUrl}: ${error.response.status} - ${error.response.statusText}`);
                }
                return null;
            } else if (error.request) {
                console.error(`No response received from ${repoUrl}:`, error.request);
                return null;
            } else {
                console.error(`Error setting up request to ${repoUrl}:`, error.message);
                return null;
            }
        }
    }
}

module.exports = { getRepoDetails };
