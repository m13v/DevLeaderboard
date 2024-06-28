// Import necessary functions
const { getAllReposInBatches, addRepoToQueue } = require('./db_repo_queue');
const { isGenAIRepo } = require('./LLM_check_genAI_tag');

// Main function to process all repos
async function processAllRepos() {
    try {
        const allRepos = await getAllReposInBatches();
        if (!Array.isArray(allRepos)) {
            throw new TypeError('Expected an array of repos');
        }
        for (const repo of allRepos) {
            const ai_tag = await isGenAIRepo(repo.fulldetails);
            console.log(`Processing repo: ${repo.repo_url}, ai_tag: ${ai_tag}`);
            await addRepoToQueue({ ...repo, ai_tag });
            console.log(`Repo ${repo.repo_url} added to queue with isGenAI: ${ai_tag}`);
        }
        console.log('All repos processed.');
    } catch (error) {
        console.error('Error processing repos:', error);
    }
}

// Execute the main function
processAllRepos();