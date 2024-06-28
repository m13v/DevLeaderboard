const { addRepoToQueue, get50Repos_AI_tag, filterReposNotInQueueOrStale, getAllReposInBatches } = require('./db_repo_queue');
const { getRepoDetails } = require('./get_repo_details');
const { isGenAIRepo } = require('./LLM_check_genAI_tag');

const axios = require('axios');


async function pushUserRepos(userJson) {
    const starredRepos = userJson.data?.user?.starredRepositories?.nodes || [];
    const contributedRepos = userJson.data?.user?.contributionsCollection?.commitContributionsByRepository?.map(repo => ({
        name: repo.repository?.name || 'unknown',
        owner: userJson.data?.user?.login || 'unknown', // Temporary placeholder
        stargazerCount: 0, // Default to 0 as we don't have stargazer count for contributed repos
        forksCount: 0 // Default to 0 as we don't have forks count for contributed repos
    })) || [];

    // Fetch actual details for contributed repos
    for (const repo of contributedRepos) {
        const repoUrl = `https://api.github.com/repos/${userJson.data?.user?.login}/${repo.name}`;
        const repoDetails = await getRepoDetails(repoUrl);

        if (repoDetails) {
            repo.owner = repoDetails.owner?.login || 'unknown';
            repo.stargazerCount = repoDetails.stargazers_count || 0;
            repo.forksCount = repoDetails.forks_count || 0;
            repo.fullDetails = repoDetails; 
        }
    }

    // Fetch actual details for starred repos
    for (const repo of starredRepos) {
        const repoUrl = `https://api.github.com/repos/${repo.owner.login}/${repo.name}`;
        const repoDetails = await getRepoDetails(repoUrl);

        if (repoDetails) {
            repo.owner = repoDetails.owner?.login || 'unknown';
            repo.stargazerCount = repoDetails.stargazers_count || 0;
            repo.forksCount = repoDetails.forks_count || 0;
            repo.fullDetails = repoDetails; 
        }
    }

    const allRepos = [...starredRepos, ...contributedRepos];
    const repoUrls = allRepos.map(repo => `https://api.github.com/repos/${repo.owner}/${repo.name}`);
    
    // Filter out repos that are already in the queue
    const newRepoUrls = await filterReposNotInQueueOrStale(repoUrls);

    if (!newRepoUrls) {
        console.error('Error: newRepoUrls is null or undefined');
        return;
    }

    for (const repo of allRepos) {
        const repoUrl = `https://api.github.com/repos/${repo.owner}/${repo.name}`;
        if (newRepoUrls.includes(repoUrl)) {
            if (repo.fullDetails) { // Check if fullDetails exists
                const ai_tag = await isGenAIRepo(repo.fullDetails); // Ensure ai_tag is defined here
                const repoData = {
                    repo_url: repoUrl,
                    stars: repo.stargazerCount,
                    forks: repo.forksCount,
                    fullDetails: repo.fullDetails || repo, 
                    started_at: repo.fullDetails?.created_at || new Date().toISOString(), 
                    ai_tag: ai_tag 
                };
                await addRepoToQueue(repoData);
            }
        }
    }
}

async function updateReposFullDetails() {
    let repos = await getAllReposInBatches();
    
    while (repos.length > 0) {
        for (const repo of repos) {
            if (!repo.fullDetails || Object.keys(repo.fullDetails).length === 0) {
                const repoDetails = await getRepoDetails(repo.repo_url);
                if (repoDetails) {
                    repo.fullDetails = repoDetails;
                    const repoData = {
                        repo_url: repo.repo_url,
                        stars: repo.stars,
                        forks: repo.forks,
                        fullDetails: repoDetails,
                        started_at: repo.started_at,
                    };
                    await addRepoToQueue(repoData);
                }
            }
        }
        repos = await get50Repos_AI_tag();
    }
}

module.exports = {
    pushUserRepos, updateReposFullDetails
};