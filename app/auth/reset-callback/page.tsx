"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';

// Initialize browser client for the reset callback
const supabase = createSupabaseBrowserClient();

/**
 * /auth/reset-callback
 * 
 * Dedicated callback for password reset (recovery) flows.
 * This route handles the code exchange and redirects the user
 * to /setup-password with the correct context.
 */
export default function ResetCallback() {
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        const TIMEOUT_MS = 8000; // 8 seconds timeout

        // Timeout fallback: If no auth event fires (e.g. invalid link), redirect to login
        const timeoutId = setTimeout(() => {
            if (mounted) {
                console.error("Reset callback: Auth check timed out");
                router.push('/login?error=recovery_failed');
            }
        }, TIMEOUT_MS);

        // Subscribe to auth state changes.
        // CRITICAL: We use onAuthStateChange instead of getSession() because getSession()
        // often returns null BEFORE the URL token is processed by the Supabase client.
        // The 'PASSWORD_RECOVERY' event guarantees the token has been consumed.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log(`Reset callback event: ${event}`);

            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
                // Auth state resolved, clear timeout and redirect to setup-password
                clearTimeout(timeoutId);
                router.push('/setup-password?source=recovery');
            }

            // We do NOT redirect on 'SIGNED_OUT' immediately because the client
            // starts in a signed-out state while processing the token.
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-400 animate-pulse">Verifying reset link...</p>
            </div>
        </div>
    );
}
