import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let browserClient: SupabaseClient | null = null;

// Browser-side client factory (Anon Key)
// Uses singleton pattern to prevent multiple GoTrueClient instances
// Safe to use in Client Components.
export const createSupabaseBrowserClient = () => {
    if (!browserClient) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            // If we are on the server (build time/SSR) and env vars are missing, return null
            // to avoid crashing the build.
            if (typeof window === 'undefined') {
                console.warn('Supabase env vars missing during SSR/Build. Returning null client.');
                return null as unknown as SupabaseClient;
            }
            throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
        }

        browserClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                detectSessionInUrl: true
            }
        });
    }
    return browserClient;
};
