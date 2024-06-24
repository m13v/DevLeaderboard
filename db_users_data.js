require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertUserData(userData) {
    const { data, error } = await supabase
        .from('users')
        .upsert([userData], { onConflict: 'github_link' }) // Use upsert with onConflict
        .select();

    if (error) {
        console.error('Error inserting/updating data:', data, 'ERROR:', error);
    } else {
        console.log('Data inserted/updated successfully:', data);
    }
}

async function getAllUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*'); 

    if (error) {
        console.error('Error fetching data:', error);
    } else {
        console.log('Data fetched successfully:', data);
    }
}

module.exports = { insertUserData, getAllUsers }; 
