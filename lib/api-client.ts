import { createSupabaseBrowserClient } from './supabase/client';

const supabase = createSupabaseBrowserClient();

/**
 * Simple Fetch Helper (Auth removed)
 * 
 * @param url The API endpoint to call
 * @param options Standard fetch options
 * @returns Promise<Response>
 */
export async function authFetch(url: string, options: RequestInit = {}) {
    return fetch(url, options);
}
