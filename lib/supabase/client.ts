import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton instance
let browserClient: SupabaseClient | null = null;

// Browser-side client factory (Anon Key)
// Uses singleton pattern to prevent multiple GoTrueClient instances
// Safe to use in Client Components.
export const createSupabaseBrowserClient = () => {
    if (!browserClient) {
        browserClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                detectSessionInUrl: true
            }
        });
    }
    return browserClient;
};
