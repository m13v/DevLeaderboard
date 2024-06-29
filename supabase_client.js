const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://ywmwzhxvyoicztpughrd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bXd6aHh2eW9pY3p0cHVnaHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxMDI2NjgsImV4cCI6MjAzNDY3ODY2OH0.6pMcHaQDYpMXEYOkOFp6umZk6Zu7a4V3ctP0ap0ejBg';

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = { supabaseClient };
