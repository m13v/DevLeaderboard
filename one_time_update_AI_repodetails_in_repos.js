const { updateRepo, printRepoData } = require('./db_repos_data');
const { getRepoDetails } = require('./get_repo_details'); // Import the missing function
const { isGenAIRepo } = require('./LLM_check_genAI_tag');

async function processReposFromPrintData() {
    try {
        const repos = await printRepoData();
        if (!Array.isArray(repos)) {
            throw new TypeError('Expected an array of repositories');
        }
        for (const repo of repos) {
            try {
                console.log(`Processing repo: ${repo.repo_url}`);
                const repoDetails = await getRepoDetails(repo.repo_url);
                const ai_tag = await isGenAIRepo(repoDetails);
                await updateRepo(repo.repo_url, repoDetails, ai_tag);
                console.log(`Updated repo: ${repo.repo_url}`);
            } catch (repoError) {
                console.error(`Error processing repo ${repo.repo_url}:`, repoError);
            }
        }
    } catch (error) {
        console.error('Error fetching repo data from printRepoData:', error);
    }
}

module.exports = { processReposFromPrintData };