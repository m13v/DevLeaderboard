// @ts-nocheck
import { getCommits } from './get_commit_refs.ts';
import { getCommitDetails } from './get_commit_details.ts';
import { extractAdditionsFromCommit } from './extract_additions_from_commit.ts';
import { getUserByGithubLink } from './db_users_data.ts'; // Import the function to check user existence
import { getUserMetricsById, getFollowersPercentile, getContributionsPercentile, getSymbolsPercentile, getRankByWeightedAveragePercentile } from './db_user_metrics.ts'; // Import the functions to get user metrics
import { getContributionsLast30Days } from './get_30day_user_contributions.ts'; // Import the function to get contributions
import { moveCommitToCompleted } from './db_queue_mgt.ts';

function extractUsernameFromGithubLink(githubLink) {
    return githubLink.split('/').pop();
}

export async function processGithubProfile(input: string) {
    if (!input) {
      throw new Error('input is required');
    }
    const username = input.includes('github.com') ? extractUsernameFromGithubLink(input) : input;
    console.log('Processing data for:', username);

    try {
        // Check if the user exists
        // const user = await getUserByGithubLink(`https://github.com/${username}`);
        // if (user && user.length > 0) {
        //     console.log(`User ${username} exists. Fetching their metrics...`);
        //     const userMetrics = await getUserMetricsById(username);
        //     console.log('User Metrics:', userMetrics);
        //     return userMetrics; // Return user metrics and stop further processing
        // } else {
        //     console.log(`User ${username} does not exist.`);
        // }

        
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

        let total_additions = 0;
        let total_symbol_count = 0;
        let total_non_empty_lines = 0;

        const commitUrls = await getCommits(username);
        console.log(commitUrls);
        const commitPromises = commitUrls.map(async (commitUrl) => {
            try {
                const commitData = await getCommitDetails(commitUrl);
                const additions_data = await extractAdditionsFromCommit(commitData);

                total_additions += commitData.stats.additions;
                total_symbol_count += additions_data.reduce((sum, file) => sum + file.symbol_count, 0);
                total_non_empty_lines += additions_data.reduce((sum, file) => sum + file.non_empty_lines, 0);
                console.log('totalNonEmptyLines=', total_non_empty_lines, ' total_symbol_count=', total_symbol_count, ' total_additions=', total_additions);

                await moveCommitToCompleted(commitUrl, {
                    ...commitData,
                    additions_data,
                    total_additions,
                    total_symbol_count,
                    total_non_empty_lines
                });

                console.log(`Processed commit: ${commitUrl}`);
            } catch (commitError) {
                console.error(`Error processing commit ${commitUrl}:`, commitError);
            }
        });

        await Promise.all(commitPromises);

        // Calculate symbols percentile
        const symbolsPercentile = await getSymbolsPercentile(total_symbol_count);
        console.log('symbolsPercentile=',symbolsPercentile);

        // Calculate weighted average
        const weightedAveragePercentile = (0.1 * followersPercentile) + (0.1 * contributionsPercentile) + (0.8 * symbolsPercentile);
        console.log('weightedAveragePercentile=' + weightedAveragePercentile);
        // Get rank by weighted average percentile
        const rank = await getRankByWeightedAveragePercentile(weightedAveragePercentile);
        console.log(`User ${username} rank: ${rank}`);

        // Return data instead of inserting
        return {
            username,
            total_additions: total_additions,
            total_symbol_count: total_symbol_count,
            total_non_empty_lines: total_non_empty_lines,
            rank
        };

    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.error(`Rate limit exceeded for GitHub profile ${username}. Please try again later.`);
        } else {
            console.error(`Error processing GitHub profile ${username}:`, error);
        }
    }
}

// module.exports = { processGithubProfile };