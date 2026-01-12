import { createClient } from '@supabase/supabase-js';

// This file should NEVER be imported on the client side.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin client factory for server-side operations (Service Role Key)
// Bypasses RLS and allows administrative auth actions.
// DO NOT use as a singleton.
export const getSupabaseAdmin = () => {
    if (!supabaseServiceKey) {
        console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
        return null;
    }
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

/**
 * Runtime verification helper to confirm Service Role usage.
 */
export async function verifyServiceRole() {
    const admin = getSupabaseAdmin();
    if (!admin) {
        return { isServiceRole: false, error: 'supabaseAdmin not initialized (missing key)' };
    }

    const { data, error } = await admin
        .from('users')
        .select('count', { count: 'exact', head: true });

    if (error) {
        return { isServiceRole: false, error: error.message };
    }
    return { isServiceRole: true };
}
