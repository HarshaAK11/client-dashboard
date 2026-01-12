export { createSupabaseBrowserClient } from './supabase/client';
// DO NOT export a singleton supabase client here.
// API routes must use createRequestClient from @/lib/supabase/server-client.
