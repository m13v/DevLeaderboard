const { getCommits } = require('./get_commit_refs');
const { getCommitDetails } = require('./get_commit_details');
const { extractAdditionsFromCommit } = require('./extract_additions_from_commit');
const { getUserByGithubLink } = require('./db_users_data'); // Import the function to check user existence
const { getUserMetricsById, getFollowersPercentile, getContributionsPercentile, getSymbolsPercentile, getRankByWeightedAveragePercentile } = require('./db_user_metrics'); // Import the functions to get user metrics
const { getContributionsLast30Days } = require('./get_30day_user_contributions'); // Import the function to get contributions

function extractUsernameFromGithubLink(githubLink) {
    return githubLink.split('/').pop();
}

async function processGithubProfile(input) {
    const username = input.includes('github.com') ? extractUsernameFromGithubLink(input) : input;
    console.log('Processing data for:', username);

    try {
        // Check if the user exists
        const user = await getUserByGithubLink(`https://github.com/${username}`);
        if (user) {
            console.log(`User ${username} exists. Fetching their metrics...`);
            const userMetrics = await getUserMetricsById(username);
            console.log('User Metrics:', userMetrics);
            return userMetrics; // Return user metrics and stop further processing
        } else {
            console.log(`User ${username} does not exist.`);
        }

        // Get contributions for the last 30 days
        const contributions = await getContributionsLast30Days(username);
        if (!contributions) {
            console.error("Failed to fetch contributions for the last 30 days.");
            return;
        }

        // Calculate percentiles
        console.log("Calculating percentiles for followers: " + contributions.followers);
        const followersPercentile = await getFollowersPercentile(contributions.followers);
        console.log('followersPercentile:', followersPercentile);

        console.log("Calculating percentiles for contributions: " + contributions.commits);
        const contributionsPercentile = await getContributionsPercentile(contributions.commits);
        console.log('contributionsPercentile:', contributionsPercentile);

        // Initialize totals
        let totalAdditions = 0;
        let totalSymbolCount = 0;
        let totalNonEmptyLines = 0;

        const commitUrls = await getCommits(username);
        console.log(commitUrls);
        for (const commitUrl of commitUrls) {
            try {
                const commitData = await getCommitDetails(commitUrl);
                const extractedData = await extractAdditionsFromCommit(commitData);

                totalAdditions += commitData.stats.additions;
                totalSymbolCount += extractedData.reduce((sum, file) => sum + file.symbol_count, 0);
                totalNonEmptyLines += extractedData.reduce((sum, file) => sum + file.non_empty_lines, 0);
                console.log('totalNonEmptyLines=',totalNonEmptyLines, ' totalSymbolCount=',totalSymbolCount, ' totalAdditions=', totalAdditions);
                console.log(`Processed commit: ${commitUrl}`);
            } catch (commitError) {
                console.error(`Error processing commit ${commitUrl}:`, commitError);
            }
        }

        // Calculate symbols percentile
        const symbolsPercentile = await getSymbolsPercentile(totalSymbolCount);
        console.log('symbolsPercentile=',symbolsPercentile);

        // Calculate weighted average
        const weightedAveragePercentile = (0.1 * followersPercentile) + (0.1 * contributionsPercentile) + (0.8 * symbolsPercentile);
        console.log('weightedAveragePercentile=' + weightedAveragePercentile);
        // Get rank by weighted average percentile
        const rank = await getRankByWeightedAveragePercentile(weightedAveragePercentile);
        console.log(`User ${username} rank: ${rank}`);

        // Print data instead of inserting
        console.log({
            username,
            total_additions: totalAdditions,
            total_symbol_count: totalSymbolCount,
            total_non_empty_lines: totalNonEmptyLines,
            rank
        });

    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.error(`Rate limit exceeded for GitHub profile ${username}. Please try again later.`);
        } else {
            console.error(`Error processing GitHub profile ${username}:`, error);
        }
    }
}

module.exports = { processGithubProfile };