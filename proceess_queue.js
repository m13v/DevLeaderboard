const { getCommitDetails } = require('./get_commit_details');
const { get50QueueContents, moveCommitToCompleted } = require('./db_queue_mgt');
const { extractAdditionsFromCommit } = require('./extract_additions_from_commit');

async function processQueue() {
    let queueContents = await get50QueueContents();

    while (queueContents.length > 0) {
        console.log(queueContents.length);   

        for (const item of queueContents) {
            const { commit_url } = item;
            console.log(`commit_url: ${commit_url}`);
            
            try {
                console.log('getCommitDetails for commit=', commit_url);
                const commitData = await getCommitDetails(commit_url);
                const extracted_data = await extractAdditionsFromCommit(commitData);
                console.log('extracted_data', extracted_data);
                await moveCommitToCompleted(commit_url, commitData);
            } catch (error) {
                console.error(`Error processing commit ${commit_url}:`, error);
            }
        }
        queueContents = await get50QueueContents();
    }
}

processQueue();