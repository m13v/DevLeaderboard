const { getCommitDetails } = require('./get_commit_details');
const { get50QueueContents, moveCommitToCompleted, checkCommitsExist, delete_commit_from_queue } = require('./db_queue_mgt');
const { extractAdditionsFromCommit } = require('./extract_additions_from_commit');

async function processQueue() {
    let queueContents = await get50QueueContents();

    while (true) {
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

                    // Calculate the new fields
                    const additions_data = extracted_data;
                    const total_additions = commitData.stats.additions;
                    const total_symbol_count = extracted_data.reduce((sum, file) => sum + file.symbol_count, 0);
                    const total_non_empty_lines = extracted_data.reduce((sum, file) => sum + file.non_empty_lines, 0);

                    // Log the calculated fields
                    console.log('additions_data', additions_data);
                    console.log('total_additions', total_additions);
                    console.log('total_symbol_count', total_symbol_count);
                    console.log('total_non_empty_lines', total_non_empty_lines);

                    await moveCommitToCompleted(commit_url, {
                        ...commitData,
                        additions_data,
                        total_additions,
                        total_symbol_count,
                        total_non_empty_lines
                    });
                } catch (error) {
                    if (error.response && error.response.status === 429) { // Assuming 429 is the rate limit status code
                        console.error(`Rate limit hit. Sleeping for 60 minutes...`);
                        await new Promise(resolve => setTimeout(resolve, 3600000)); // Sleep for 60 minutes
                    } else {
                        console.error(`Error processing commit ${commit_url}:`, error);
                    }
                }
            }
            queueContents = await get50QueueContents();
        }

        // Sleep for 60 minutes (3600000 milliseconds) before checking the queue again
        console.log('Queue is empty. Sleeping for 60 minutes...');
        await new Promise(resolve => setTimeout(resolve, 3600000));
        queueContents = await get50QueueContents();
    }
}

processQueue();
