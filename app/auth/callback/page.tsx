"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';

// Initialize browser client for the auth callback
const supabase = createSupabaseBrowserClient();

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        const handleAuthCallback = async () => {
            try {
                // 1. Get Session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    console.error("Auth callback: No session or error", sessionError);
                    if (mounted) router.push('/login?error=no_session');
                    return;
                }

                // 2. Validate Session with Backend (with timeout)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                try {
                    const res = await fetch('/api/auth/post-login', {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (!res.ok) {
                        throw new Error(`Server responded with ${res.status}`);
                    }

                    const result = await res.json();

                    if (!result.ok) {
                        console.error("Auth callback: Backend validation failed", result);
                        if (mounted) window.location.href = '/not-authorized';
                        return;
                    }

                    // 3. Route based on password state
                    if (mounted) {
                        if (!result.hasPassword) {
                            window.location.href = '/setup-password';
                        } else {
                            window.location.href = '/';
                        }
                    }

                } catch (fetchError: any) {
                    clearTimeout(timeoutId);
                    console.error("Auth callback: Fetch error", fetchError);

                    // If it's a network error or timeout, we might want to let them in if we have a session,
                    // OR fail safe. For now, fail safe to login.
                    if (mounted) router.push('/login?error=validation_failed');
                }

            } catch (err) {
                console.error("Auth callback: Unexpected error", err);
                if (mounted) router.push('/login?error=unexpected');
            }
        };

        handleAuthCallback();

        return () => {
            mounted = false;
        };
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-400 animate-pulse">Completing authentication...</p>
            </div>
        </div>
    );
}
