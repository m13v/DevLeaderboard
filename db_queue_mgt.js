require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertData(commitUrls, username) {
    const rows = commitUrls.map(url => ({
        commit_url: url,
        user: username,
    }));

    const { data: queueData, error: queueError } = await supabase
        .from('queue')
        .insert(rows, { onConflict: ['commit_url'] });

    if (queueError) {
        console.error('Error inserting into queue:', queueError);
    } else {
        console.log('Inserted into queue:', queueData);
    }
}

async function checkCommitsExist(commit_urls) {
    const { data, error } = await supabase
        .from('completed_shas')
        .select('commit_url')
        .in('commit_url', commit_urls);

    if (error) {
        console.error('Error checking commit existence:', error);
        return [];
    }

    return data.map(row => row.commit_sha);
}

async function getAllQueueContents() {
    const { data, error } = await supabase
        .from('queue')
        .select('*');

    if (error) {
        console.error('Error fetching queue contents:', error);
        return [];
    }

    return data;
}

async function moveShaToCompleted(commit_url, commitData) {
    const { data: queueData, error: queueError } = await supabase
        .from('queue')
        .select('*')
        .eq('commit_url', commit_url)
        .single();

    if (queueError) {
        console.error('Error fetching from queue:', queueError);
        return;
    }

    const { user, commit_url: commitUrl } = queueData; 
    const { data: completedData, error: completedError } = await supabase
        .from('completed_shas')
        .insert([{ users: user, commit_url: commitUrl, commit_data: commitData }]); 

    if (completedError) {
        console.error('Error inserting into completed_shas:', completedError);
        return;
    }

    const { error: deleteError } = await supabase
        .from('queue')
        .delete()
        .eq('commit_url', commitUrl); 

    if (deleteError) {
        console.error('Error deleting from queue:', deleteError);
    } else {
        console.log('Moved sha to completed_shas:', completedData);
    }
}

module.exports = { insertData, checkCommitsExist, getAllQueueContents, moveShaToCompleted };