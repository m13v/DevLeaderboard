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
            let users;
            do {
                console.log('Current offset: ' + offset);
                users = await getLimitedUsers(limit, offset);
                offset += limit;

                const now = new Date();

                for (const user of users) {
                    const lastCheck = user.last_queue_check ? new Date(user.last_queue_check) : null;
                    const timeDiff = lastCheck ? now - lastCheck : Infinity;
                    const hoursDiff = timeDiff / (1000 * 60 * 60);

                    if (!user.last_queue_check || hoursDiff > 24) {
                        const username = extractUsernameFromGithubLink(user.github_link);
                        console.log('Requesting data for: ', username);
                        const commitUrls = await fetchAndRetryIfNecessary(() => getCommits(username));
                        const newCommitUrls = await filterNewCommits(commitUrls);
                        console.log('newCommitUrls: ', newCommitUrls);

                        if (newCommitUrls.length > 0) {
                            await insertData(newCommitUrls, username);
                        }
                    }
                }
            } while (users.length === limit);
        } catch (error) {
            console.error('Error processing users:', error);
        }

        console.log('Sleeping for 20 minutes...');
        await sleep(20 * 60 * 1000); // Sleep for 20 minutes
    }
}

processUsers();