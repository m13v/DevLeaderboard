require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertData() {
    // Insert into 'queue' table
    const { data: queueData, error: queueError } = await supabase
        .from('queue')
        .insert([
            { repo: 'repo1', user: 'user1', commit_sha: 'commit_sha1', created_at: new Date(), updated_at: new Date() }
        ]);

    if (queueError) {
        console.error('Error inserting into queue:', queueError);
    } else {
        console.log('Inserted into queue:', queueData);
    }
}

// Export the function for use in other scripts
module.exports = { insertData };

// // Run the function if the script is executed directly from the terminal
// if (require.main === module) {
//     insertData().catch(console.error);
// }