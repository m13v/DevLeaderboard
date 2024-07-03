import { config } from "https://deno.land/x/dotenv/mod.ts";
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const env = config();
const SUPABASE_URL: string = env.SUPABASE_URL ?? 'https://ywmwzhxvyoicztpughrd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY: string = env.SUPABASE_SERVICE_ROLE_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3bXd6aHh2eW9pY3p0cHVnaHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxMDI2NjgsImV4cCI6MjAzNDY3ODY2OH0.6pMcHaQDYpMXEYOkOFp6umZk6Zu7a4V3ctP0ap0ejBg';

const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export { supabaseClient };
