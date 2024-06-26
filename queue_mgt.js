const { getLimitedUsers } = require('./db_users_data');
const { getCommits } = require('./get_commit_refs');
const { insertData, checkCommitsExist } = require('./db_queue_mgt');

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
    while (true) {
        try {
            const users = await getLimitedUsers();
            const now = new Date();

            for (const user of users) {
                const lastCheck = user.last_queue_check ? new Date(user.last_queue_check) : null;
                const timeDiff = lastCheck ? now - lastCheck : Infinity;
                const hoursDiff = timeDiff / (1000 * 60 * 60);

                if (!user.last_queue_check || hoursDiff > 24) {
                    const username = extractUsernameFromGithubLink(user.github_link);
                    console.log('Requesting data for: ', username);
                    const commitUrls = await fetchAndRetryIfNecessary(() => getCommits(username));
                    console.log('commitUrls: ', commitUrls);
                    const existingShas = await checkCommitsExist(commitUrls);
                    console.log('existingShas: ', existingShas);
                    const newCommitUrls = commitUrls.filter(url => !existingShas.includes(url.split('/').pop()));
                    console.log('newCommitUrls: ', newCommitUrls);

                    if (newCommitUrls.length > 0) {
                        await insertData(newCommitUrls, username);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing users:', error);
        }

        console.log('Sleeping for 60 minutes...');
        await sleep(60 * 60 * 1000); // Sleep for 60 minutes
    }
}

processUsers();