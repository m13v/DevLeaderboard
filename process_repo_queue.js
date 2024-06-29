const { get50Repos_AI_tag } = require('./db_repo_queue');
const { fetchContributors } = require('./get_contributors');
const { deleteRepoFromQueue } = require('./db_repo_queue');
const { updateRepo } = require('./db_repos_data'); // Import the new function

async function processRepos() {
    while (true) {
        try {
            const repos = await get50Repos_AI_tag();
            if (repos.length === 0) {
                console.log('No repos fetched from the queue. Sleeping for 20 minutes...');
                await new Promise(resolve => setTimeout(resolve, 20 * 60 * 1000));
                continue;
            }
            console.log(`Fetched ${repos.length} repos from the queue.`);

            for (const repo of repos) {
                try {
                    console.log(`Processing repo: ${repo.repo_url}`);
                    await fetchContributors(repo.repo_url);
                    console.log(`Processing contributors: ${repo.repo_url}`);
                    await deleteRepoFromQueue(repo.repo_url);
                    console.log(`Deleted repo from queue`);
                    await updateRepo(repo.repo_url, repo.fulldetails, repo.ai_tag); 
                    console.log(`Updated repo url and fulldetails`);
                } catch (repoError) {
                    if (repoError.response && (repoError.response.status === 429 || repoError.response.status === 403)) {
                        console.error(`Rate limit or forbidden error hit. Sleeping for 20 minutes...`);
                        await new Promise(resolve => setTimeout(resolve, 20 * 60 * 1000));
                    } else {
                        console.error(`Error processing repo ${repo.repo_url}:`, repoError);
                    }
                }
            }

            // Sleep for 60 minutes
            console.log('Sleeping for 20 minutes...');
            await new Promise(resolve => setTimeout(resolve, 20 * 60 * 1000));
        } catch (error) {
            console.error('Error fetching repos from the queue:', error);
        }
    }
}

processRepos();
