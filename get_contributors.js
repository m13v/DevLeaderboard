require('dotenv').config();
const axios = require('axios');
const { insertData } = require('./db_repos_data');

async function getRepoDetails(repoUrl) {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Authorization': `token ${token}`
    };
    const repoParts = repoUrl.replace(/\/$/, '').split('/');
    const owner = repoParts[repoParts.length - 2];
    const repo = repoParts[repoParts.length - 1].replace('.git', '');
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    try {
        const response = await axios.get(apiUrl, { headers });
        if (response.status === 200) {
            return {
                stars: response.data.stargazers_count,
                commits: await getCommitsCount(owner, repo, headers)
            };
        } else {
            console.error(`Failed to fetch repo details: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null;
    }
}

async function getCommitsCount(owner, repo, headers) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
    try {
        const response = await axios.get(apiUrl, { headers, params: { per_page: 1 } });
        if (response.status === 200) {
            const linkHeader = response.headers.link;
            if (linkHeader) {
                const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
                if (lastPageMatch) {
                    return parseInt(lastPageMatch[1], 10);
                }
            }
            return response.data.length;
        } else {
            console.error(`Failed to fetch commits count: ${response.status}`);
            return 0;
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return 0;
    }
}

async function getContributors(repoUrl) {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'Authorization': `token ${token}`
    };
    const repoParts = repoUrl.replace(/\/$/, '').split('/');
    const apiUrl = `https://api.github.com/repos/${repoParts[repoParts.length - 2]}/${repoParts[repoParts.length - 1].replace('.git', '')}/contributors`;

    let contributors = [];
    let page = 1;

    while (true) {
        try {
            const response = await axios.get(apiUrl, {
                headers: headers,
                params: { per_page: 100, page: page }
            });

            if (response.status === 200) {
                const data = response.data;
                if (data.length === 0) break;
                contributors = contributors.concat(data);
                page++;
            } else {
                console.error(`Failed to fetch contributors: ${response.status}`);
                break;
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    console.error("Failed to fetch contributors: 401 Unauthorized");
                } else if (error.response.status === 404) {
                    console.error("Failed to fetch contributors: 404 Not Found");
                } else {
                    console.error(`Failed to fetch contributors: ${error.response.status}`);
                }
            } else {
                console.error(`Error: ${error.message}`);
            }
            break;
        }
    }

    return contributors;
}

(async () => {
    const repoUrl = process.argv[2];
    const repoParts = repoUrl.replace(/\/$/, '').split('/');
    const repoName = repoParts[repoParts.length - 1].replace('.git', '');

    const repoDetails = await getRepoDetails(repoUrl);
    if (repoDetails) {
        console.log(`Stars: ${repoDetails.stars}`);
        console.log(`Commits: ${repoDetails.commits}`);
    }
    const contributors = await getContributors(repoUrl);
    const numContributors = contributors.length;
    console.log(`Contributors: ${numContributors}`);
    contributors.forEach(contributor => {
        console.log(`${contributor.login}: ${contributor.contributions} contributions`);
    });

    if (repoDetails) {
        await insertData(repoName, numContributors, repoDetails.stars, repoDetails.commits);
    }
})();