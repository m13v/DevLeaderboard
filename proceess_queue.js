const { getCommitDetails } = require('./get_commit_details');
const { getAllQueueContents, moveShaToCompleted } = require('./db_queue_mgt');


async function processQueue() {
    const queueContents = await getAllQueueContents();
    console.log(queueContents);

    for (const item of queueContents) {
        const { commit_url } = item;
        console.log(`commit_url: ${commit_url}`);
        // break;
        try {
            console.log('getCommitDetails for commit=', commit_url);
            const commitData = await getCommitDetails(commit_url);
            await moveShaToCompleted(commit_url, commitData);
        } catch (error) {
            console.error(`Error processing commit ${commit_url}:`, error);
        }
    }
}

processQueue();