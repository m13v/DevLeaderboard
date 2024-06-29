require('dotenv').config();
const { supabaseClient } = require('./supabase_client.js');

const supabase = supabaseClient;

async function insertData(repo_url, contributors, stars, commits) {
    const newRepo = {
        repo_url,
        contributors,
        stars,
        commits,
        last_request: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('repos')
        .upsert(newRepo, { onConflict: 'repo_url' })
        .select();

    if (error) {
        console.error('Error inserting/updating data:', error);
    } else {
        console.log('Inserted/Updated data:', data);
    }
}

async function printRepoData() {
    const { data, error } = await supabase
        .from('repos')
        .select('*');

    if (error) {
        console.error('Error fetching data:', error);
        return [];
    } else {
        console.log('Repository Data:', data);
        return data; // Return the fetched data
    }
}

async function updateRepo(repo_url, fulldetails, ai_tag) {
    const { data, error } = await supabase
        .from('repos')
        .update({ fulldetails, ai_tag })
        .eq('repo_url', repo_url);

    if (error) {
        console.error('Error updating repo:', error);
    } else {
        console.log('Updated repo:', data);
    }
}

module.exports = { insertData, printRepoData, updateRepo };