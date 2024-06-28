require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addRepoToQueue(repoData) {
    const { repo_url, stars, started_at, forks, fullDetails, ai_tag } = repoData;
    const added_at = new Date().toISOString();

    // Fetch existing record
    const { data: existingData, error: fetchError } = await supabase
        .from('repo_queue')
        .select('fulldetails, ai_tag')
        .eq('repo_url', repo_url)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('Error fetching existing repo data:', fetchError);
        return null;
    }

    const updatedFullDetails = fullDetails || (existingData ? existingData.fulldetails : {});
    const updatedAiTag = ai_tag || (existingData ? existingData.ai_tag : null);

    const { data, error } = await supabase
        .from('repo_queue')
        .upsert([
            {
                repo_url: repo_url,
                stars: stars || null,
                started_at: started_at || null,
                added_at: added_at,
                forks: forks || null,
                fulldetails: updatedFullDetails,
                ai_tag: updatedAiTag
            }
        ], { onConflict: 'repo_url' });

    if (error) {
        console.error('Error adding/updating repo in queue:', error);
        return null;
    }

    console.log('Repo added/updated in queue:', repo_url);
    return data;
}

async function get50Repos_AI_tag() {
    const { data, error } = await supabase
        .from('repo_queue')
        .select('*')
        .eq('ai_tag', 'yes')
        .order('stars', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching repos:', error);
        return null;
    }

    console.log('Fetched repos:', data);
    return data;
}

async function deleteRepoFromQueue(repo_url) {
    const { data, error } = await supabase
        .from('repo_queue')
        .delete()
        .eq('repo_url', repo_url);

    if (error) {
        console.error('Error deleting repo from queue:', error);
        return null;
    }

    console.log('Repo deleted from queue:', data);
    return data;
}

async function filterReposNotInQueue(repo_urls) {
    const { data: existingRepos, error } = await supabase
        .from('repo_queue')
        .select('repo_url')
        .in('repo_url', repo_urls);

    if (error) {
        console.error('Error fetching repos from queue:', error);
        return null;
    }

    const existingRepoUrls = new Set(existingRepos.map(repo => repo.repo_url));
    const filteredRepos = repo_urls.filter(repo_url => !existingRepoUrls.has(repo_url));

    return filteredRepos;
}

async function filterReposNotInQueueOrStale(repo_urls) {
    // First request: Filter repo_queue table
    const { data: queueRepos, error: queueError } = await supabase
        .from('repo_queue')
        .select('repo_url')
        .in('repo_url', repo_urls);

    if (queueError) {
        console.error('Error fetching repos from repo_queue table:', queueError);
        return null;
    }

    const queueRepoUrls = new Set(queueRepos.map(repo => repo.repo_url));
    const notInQueue = repo_urls.filter(repo_url => !queueRepoUrls.has(repo_url));

    // Second request: Filter repos table
    const { data: recentRepos, error: recentError } = await supabase
        .from('repos')
        .select('repo_url, last_request')
        .in('repo_url', notInQueue);

    if (recentError) {
        console.error('Error fetching repos from repos table:', recentError);
        return null;
    }

    const now = new Date();
    const staleRepoUrls = new Set(
        recentRepos
            .filter(repo => {
                const lastRequest = new Date(repo.last_request);
                return (now - lastRequest) <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            })
            .map(repo => repo.repo_url)
    );

    const filteredRepos = notInQueue.filter(repo_url => !staleRepoUrls.has(repo_url));

    return filteredRepos;
}

async function getAllReposInBatches() {
    let allRepos = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('repo_queue')
            .select('*')
            .order('stars', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching repos:', error);
            return null;
        }

        if (data.length > 0) {
            allRepos = allRepos.concat(data);
            offset += limit;
        } else {
            hasMore = false;
        }
    }

    console.log('Fetched all repos:', allRepos);
    return allRepos;
}

module.exports = {
    addRepoToQueue,
    get50Repos_AI_tag,
    deleteRepoFromQueue,
    filterReposNotInQueue,
    getAllReposInBatches,
    filterReposNotInQueueOrStale
};