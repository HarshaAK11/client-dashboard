import { cookies } from 'next/headers';

/**
 * TEMPORARY AUTH WORKAROUND - Session Management
 * 
 * This file handles the temporary demo session cookie used for authentication
 * during the transition period.
 * 
 * @deprecated This is part of the temporary auth workaround and should be removed
 * when transitioning to full Supabase Auth.
 */

export const DEMO_SESSION_COOKIE = 'demo_session';

/**
 * Sets the demo session cookie.
 */
export async function setDemoSession() {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });
}

/**
 * Checks if a demo session is active.
 */
export async function hasDemoSession(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.has(DEMO_SESSION_COOKIE);
}

/**
 * Clears the demo session cookie.
 */
export async function clearDemoSession() {
    const cookieStore = await cookies();
    cookieStore.delete(DEMO_SESSION_COOKIE);
}
