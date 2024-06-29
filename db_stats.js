require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Connected to the database.');

async function fetchLastEntry() {
    try {
        const { data, error } = await supabase
            .from('database_stats')
            .select('*')
            .order('recorded_at', { ascending: false })
            .limit(50);

        if (error) {
            throw error;
        }

        data.forEach(entry => {
            const recordedAt = new Date(entry.recorded_at);
            const options = { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' };
            entry.recorded_at = recordedAt.toLocaleTimeString('en-US', options);
        });

        console.table(data);

        setInterval(async () => {
            try {
                const { data, error } = await supabase
                    .from('database_stats')
                    .select('*')
                    .order('recorded_at', { ascending: false })
                    .limit(50);

                if (error) {
                    throw error;
                }

                data.forEach(entry => {
                    const recordedAt = new Date(entry.recorded_at);
                    const options = { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' };
                    entry.recorded_at = recordedAt.toLocaleTimeString('en-US', options);
                });

                console.clear();
                console.table(data);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        }, 60000); // 60000 ms = 1 minute
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}

fetchLastEntry();