const { getAllUsers } = require('./db_users_data');
const { getCommits } = require('./get_commit_refs');
const { insertData, checkCommitsExist } = require('./db_queue_mgt');

function extractUsernameFromGithubLink(githubLink) {
    return githubLink.split('/').pop();
}

async function processUsers() {
    try {
        const users = await getAllUsers();
        const now = new Date();

        for (const user of users) {
            const lastCheck = user.last_queue_check ? new Date(user.last_queue_check) : null;
            const timeDiff = lastCheck ? now - lastCheck : Infinity;
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            if (!user.last_queue_check || hoursDiff > 24) {
                const username = extractUsernameFromGithubLink(user.github_link);
                console.log('Requesting data for: ', username);
                const commitUrls = await getCommits(username);
                const existingShas = await checkCommitsExist(commitUrls);
                const newCommitUrls = commitUrls.filter(url => !existingShas.includes(url.split('/').pop()));

                if (newCommitUrls.length > 0) {
                    await insertData(newCommitUrls, username); // Pass both commitUrls and username
                }
            }
        }
    } catch (error) {
        console.error('Error processing users:', error);
    }
}

processUsers();