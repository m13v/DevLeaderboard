require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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