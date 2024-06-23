const axios = require('axios');
require('dotenv').config();

async function getCommitDetails(owner, repo, ref, token) {
    // GitHub API URL
    const url = `https://api.github.com/repos/${owner}/${repo}/commits/${ref}`;

    // Headers
    const headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`
    };

    try {
        // Make the request
        const response = await axios.get(url, { headers });
        const commitData = response.data;
        console.log(commitData);  // Add this line

        // Print additions and deletions
        commitData.files.forEach(file => {
            const filename = file.filename;
            const patch = file.patch;
            console.log(`File: ${filename}`);
            console.log(patch);
            console.log("-".repeat(40));
        });
    } catch (error) {
        console.error('Error fetching commit details:', error);
    }
}

function main() {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        throw new Error("GITHUB_TOKEN environment variable not set");
    }

    // Replace with your values
    const owner = "matthew-heartful";
    const repo = "DevLeaderboard";
    const ref = "11cc5a970cb50acefd194cc8c82369192a4dc409";
    getCommitDetails(owner, repo, ref, githubToken);
}


// main();