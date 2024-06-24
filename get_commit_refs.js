require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.GITHUB_TOKEN;
const DAYS = 30;

async function getCommits(username) {
    if (!username) {
        throw new Error('Please provide a GitHub username.');
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - DAYS);
    const since = sinceDate.toISOString();

    const eventsUrl = `https://api.github.com/users/${username}/events`;
    const headers = { Authorization: `token ${TOKEN}` };
    const { data: events } = await axios.get(eventsUrl, { headers });

    const commits = [];

    events.forEach(event => {
        if (event.type === 'PushEvent') {
            event.payload.commits.forEach(commit => {
                if (event.actor.login === username) {
                    commits.push(commit.sha);
                }
            });
        }
    });

    return commits;
}

module.exports = { getCommits };


// require('dotenv').config();
// const axios = require('axios');

// const TOKEN = process.env.GITHUB_TOKEN;
// const DAYS = 30;

// async function getCommits(username) {
//     if (!username) {
//         throw new Error('Please provide a GitHub username.');
//     }

//     const sinceDate = new Date();
//     sinceDate.setDate(sinceDate.getDate() - DAYS);
//     const since = sinceDate.toISOString();

//     const reposUrl = `https://api.github.com/users/${username}/repos`;
//     const headers = { Authorization: `token ${TOKEN}` };
//     const { data: repos } = await axios.get(reposUrl, { headers });

//     const commits = [];

//     for (const repo of repos) {
//         console.log(`Fetching commits for repository: ${repo.name}`);
//         const commitsUrl = `https://api.github.com/repos/${username}/${repo.name}/commits?since=${since}`;
//         const { data: repoCommits } = await axios.get(commitsUrl, { headers });

//         repoCommits.forEach(commit => {
//             commits.push(commit.sha);
//         });
//     }

//     return commits;
// }

// module.exports = { getCommits };