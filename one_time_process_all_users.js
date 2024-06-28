const { getLimitedUsers } = require('./db_users_data');
const { getCommits } = require('./get_commit_refs');
const { insertData, filterNewCommits } = require('./db_queue_mgt');

function extractUsernameFromGithubLink(githubLink) {
    return githubLink.split('/').pop();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getMillisToSleep(retryHeaderString) {
    let millisToSleep = Math.round(parseFloat(retryHeaderString) * 1000);
    if (isNaN(millisToSleep)) {
        millisToSleep = Math.max(0, new Date(retryHeaderString) - new Date());
    }
    return millisToSleep;
}

async function fetchAndRetryIfNecessary(callAPIFn) {
    const response = await callAPIFn();
    if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const millisToSleep = getMillisToSleep(retryAfter);
        await sleep(millisToSleep);
        return fetchAndRetryIfNecessary(callAPIFn);
    }
    return response;
}

async function processUsers() {
        try {
            const users = await getLimitedUsers();

            for (const user of users) {
                const username = extractUsernameFromGithubLink(user.github_link);
                console.log('Requesting data for: ', username);
                const commitUrls = await fetchAndRetryIfNecessary(() => getCommits(username));
                // console.log('commitUrls: ', commitUrls);
                const newCommitUrls = await filterNewCommits(commitUrls);
                console.log('newCommitUrls: ', newCommitUrls);

                if (newCommitUrls.length > 0) {
                    await insertData(newCommitUrls, username);
                }
            }
        } catch (error) {
            console.error('Error processing users:', error);
        }
    }

processUsers();