require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllUserMetrics() {
    const { data, error } = await supabase
        .from('user_metrics')
        .select('*');

    if (error) {
        console.error('Error fetching user metrics:', error);
        return null;
    }

    return data;
}

// Example usage
getAllUserMetrics().then(data => {
    if (data) {
        console.log('User Metrics:', data);
    }
});