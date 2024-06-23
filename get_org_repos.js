require('dotenv').config();
const axios = require('axios');

async function getReposForOrg(orgUrl) {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Authorization': `token ${token}`
    };
    const orgName = orgUrl.replace(/\/$/, '').split('/').pop();
    const apiUrl = `https://api.github.com/orgs/${orgName}/repos`;

    try {
        const response = await axios.get(apiUrl, { headers, params: { per_page: 100 } });
        if (response.status === 200) {
            return response.data.map(repo => ({
                name: repo.name,
                stars: repo.stargazers_count,
                url: repo.html_url
            }));
        } else {
            console.error(`Failed to fetch repos for org: ${response.status}`);
            return [];
        }
    } catch (error) {
        if (error.response) {
            console.error(`Error: ${error.response.status} - ${error.response.data.message}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
        return [];
    }
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function createGithubUrl(orgName) {
    return `https://github.com/${orgName}`;
}

async function getTopRepoForOrg(orgUrl) {
    if (!isValidUrl(orgUrl)) {
        orgUrl = createGithubUrl(orgUrl);
        if (!isValidUrl(orgUrl)) {
            throw new Error("Invalid organization URL provided.");
        }
    }

    const repos = await getReposForOrg(orgUrl);
    if (repos.length === 0) {
        throw new Error("Failed to fetch repositories for the organization.");
    }

    // Sort repositories by stars in descending order
    repos.sort((a, b) => b.stars - a.stars);

    // Return the top repository URL
    return repos[0].url;
}

module.exports = { getTopRepoForOrg };