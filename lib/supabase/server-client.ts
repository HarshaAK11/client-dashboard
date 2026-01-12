import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a fresh, request-scoped Supabase client instance.
 * 
 * CRITICAL SECURITY REQUIREMENT:
 * Supabase clients with Authorization headers must NEVER be singletons on the server.
 * 
 * Why?
 * In a multi-tenant environment, a singleton client shared across requests will leak 
 * authentication state. If Request A sets a session/header on a singleton, Request B 
 * (from a different tenant) will inherit that state, leading to unauthorized data 
 * access or RLS conflicts (403 Forbidden).
 * 
 * This factory function ensures that every request gets its own isolated instance 
 * with zero shared state.
 * 
 * @param accessToken - The Supabase access token for the current request.
 */
export function createRequestClient(accessToken: string) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false, // CRITICAL: Disable persistence to prevent cross-request leakage
            autoRefreshToken: false, // CRITICAL: Disable refresh on server to keep client stateless
            detectSessionInUrl: false
        },
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    });
}
