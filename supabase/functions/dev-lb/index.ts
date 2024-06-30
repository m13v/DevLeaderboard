// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"

console.log("Hello from Functions!")

import { serve } from 'https://deno.land/std@0.201.0/http/server.ts';
import { handler1 } from './handlers/handler1.ts';
import { lookupUserHandler } from './handlers/lookup_user_handler.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  console.log(`Received request: ${req.method} ${req.url}`); // Log request method and URL

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('Invoking handler1');
  return lookupUserHandler(req);
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/lookup-user' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"username":"exampleUser"}'

*/
