import { createSupabaseBrowserClient } from './supabase/client';

const supabase = createSupabaseBrowserClient();

/**
 * Centered Authenticated Fetch Helper
 * 
 * Automatically retrieves the current Supabase session, extracts the access token,
 * and attaches it to the Authorization header.
 * 
 * @param url The API endpoint to call
 * @param options Standard fetch options
 * @returns Promise<Response>
 * @throws Error if no active session is found
 */
export async function authFetch(url: string, options: RequestInit = {}) {
    // 1. Retrieve the current session
    // getSession() is preferred on the client as it's fast and handles token refresh
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        console.error('❌ AuthFetch: No active session found');
        throw new Error('Authentication required. Please sign in.');
    }

    // 2. Extract the access token
    const token = session.access_token;

    // 3. Merge headers
    const headers = new Headers(options.headers);

    // Ensure we don't overwrite an existing Authorization header if one was explicitly passed
    if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // 4. Execute the fetch
    return fetch(url, {
        ...options,
        headers,
    });
}
