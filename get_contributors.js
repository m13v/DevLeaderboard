require('dotenv').config();
const axios = require('axios');

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
    const contributors = await getContributors(repoUrl);
    contributors.forEach(contributor => {
        console.log(`${contributor.login}: ${contributor.contributions} contributions`);
    });
})();