require('dotenv').config();
const { supabaseClient } = require('./supabase_client.js');

const supabase = supabaseClient;

async function getAllUserCommitStats() {
    const { data, error } = await supabase
        .from('user_commit_stats')
        .select('*');

    if (error) {
        console.error('Error fetching user commit stats:', error);
        return null;
    }

    return data;
}

// Example usage
getAllUserCommitStats().then(data => {
    if (data) {
        console.log('User Commit Stats:', data);
    }
});