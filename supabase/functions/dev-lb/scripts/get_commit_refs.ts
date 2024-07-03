import process from 'node:process';
import axios from 'npm:axios';

const TOKEN: string = process.env.GITHUB_TOKEN as string;
const DAYS: number = 30;

interface GitHubEvent {
    type: string;
    actor: { login: string };
    payload: { commits: { url: string }[] };
}

export async function getCommits(username: string): Promise<string[]> {
    if (!username) {
        throw new Error('Please provide a GitHub username.');
    }
    const eventsUrl = `https://api.github.com/users/${username}/events`;
    const headers = { Authorization: `token ${TOKEN}` };
    const { data: events } = await axios.get<GitHubEvent[]>(eventsUrl, { headers });
    const commitShas: string[] = [];
    events.forEach(event => {
        if (event.type === 'PushEvent' && event.actor.login === username) {
            event.payload.commits.forEach(commit => {
                commitShas.push(commit.url);
            });
        }
    });

    return commitShas;
}


// require('dotenv').config();
// const axios = require('axios');

// const TOKEN = process.env.GITHUB_TOKEN;
// const USERNAME = 'jerryjliu';
// const headers = { Authorization: `token ${TOKEN}` };

// async function getCommitUrls(username) {
//     const reposUrl = `https://api.github.com/users/${username}/repos`;
//     const { data: repos } = await axios.get(reposUrl, { headers });
//     console.log('repos=',JSON.stringify(repos));
//     const commitUrls = [];
    
//     for (const repo of repos) {
//         const branchesUrl = `https://api.github.com/repos/${username}/${repo.name}/branches`;
//         const { data: branches } = await axios.get(branchesUrl, { headers });
//         console.log('branches=',JSON.stringify(branches));

//         for (const branch of branches) {
//             const commitsUrl = `https://api.github.com/repos/${username}/${repo.name}/commits?sha=${branch.name}`;
//             const { data: commits } = await axios.get(commitsUrl, { headers });
//             console.log('commits=',JSON.stringify(commits));
//             commits.forEach(commit => {
//                 commitUrls.push(commit.url);
//             });
//         }
//     }

//     return commitUrls;
// }

// getCommitUrls(USERNAME).then(urls => console.log(urls)).catch(err => console.error(err));



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