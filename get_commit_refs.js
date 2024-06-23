require('dotenv').config();
const axios = require('axios');

const USERNAME = 'asafgardin';
const TOKEN = process.env.GITHUB_TOKEN;
const DAYS = 30;

async function getCommits() {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - DAYS);
    const since = sinceDate.toISOString();

    const eventsUrl = `https://api.github.com/users/${USERNAME}/events`;
    const headers = { Authorization: `token ${TOKEN}` };
    const { data: events } = await axios.get(eventsUrl, { headers });

    // Log the events to debug
    // console.log('Fetched events:', events);

    const commits = [];

    events.forEach(event => {
        if (event.type === 'PushEvent') {
            event.payload.commits.forEach(commit => {
                if (event.actor.login === USERNAME) {
                    commits.push(commit.sha);
                }
            });
        }
    });

    return commits;
}


// getCommits().then(commits => {
//     console.log('Commit SHAs:', commits);
// });
