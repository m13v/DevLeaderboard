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
    let offset = 0;
    const limit = 50;

    while (true) {
        try {
            const users = await getLimitedUsers(limit, offset);
            if (users.length === 0) break; // No more users to process

            for (const user of users) {
                const username = extractUsernameFromGithubLink();
                console.log('Requesting data for: ', username);
                const commitUrls = await fetchAndRetryIfNecessary(() => getCommits(username));
                const newCommitUrls = await filterNewCommits(commitUrls);
                console.log('newCommitUrls: ', newCommitUrls);

                if (newCommitUrls.length > 0) {
                    await insertData(newCommitUrls, username);
                }
            }

            offset += limit; // Move to the next chunk
        } catch (error) {
            console.error('Error processing users:', error);
        }
    }
}

processUsers();