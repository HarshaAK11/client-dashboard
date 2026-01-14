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
            console.warn('Supabase env vars missing in createSupabaseBrowserClient');
            // Return a dummy client or null if strictly necessary, but better to throw or handle upstream.
            // For build time, if we are just prerendering and not fetching, maybe we can survive?
            // But createClient throws if url is missing.
            if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
                // During build/SSR, if vars are missing, we might want to skip or fail gracefully?
                // But usually they should be there.
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
