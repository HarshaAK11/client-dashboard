"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Initialize browser client for the setup password page
const supabase = createSupabaseBrowserClient();

export default function SetupPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let mounted = true;
        const TIMEOUT_MS = 5000; // 5 seconds timeout

        // Timeout fallback to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (mounted && isChecking) {
                console.warn("Setup password: Auth check timed out");
                router.push('/login?error=timeout');
            }
        }, TIMEOUT_MS);

        // 1. Listen for auth state changes (CRITICAL for recovery flow)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`Setup password: Auth event ${event}`);

            if (!mounted) return;

            if (event === 'PASSWORD_RECOVERY') {
                // Explicit recovery event - allow access immediately
                setIsChecking(false);
                clearTimeout(timeoutId);
                return;
            }

            if (event === 'SIGNED_OUT') {
                // Only redirect to login if we explicitly get a SIGNED_OUT event
                // AND we are not waiting for a recovery event (which might start signed out)
                // However, usually SIGNED_OUT comes after a session is killed.
                // We'll let the timeout handle the initial "not signed in yet" case.
                return;
            }

            // For other events (SIGNED_IN, INITIAL_SESSION), validate the user state
            if (session?.user) {
                const user = session.user;

                // GUARD: Allow access only for:
                // 1. Invited users who haven't set a password yet
                // 2. Users in a recovery (password reset) flow

                const isInvitedWithoutPassword =
                    user.user_metadata?.invited_at &&
                    !user.user_metadata?.password_set;

                // Check for recovery flag in URL or AMR (Authentication Method Reference)
                const isRecoveryFlow =
                    searchParams.get('source') === 'recovery' ||
                    (session as any)?.amr?.some((m: any) => m.method === 'recovery');

                if (isInvitedWithoutPassword || isRecoveryFlow) {
                    // Valid state for this page
                    setIsChecking(false);
                    clearTimeout(timeoutId);
                } else {
                    // User already has a password and is not in a reset flow
                    console.log("Setup password: User already has password, redirecting to dashboard");
                    router.push('/');
                }
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [router, searchParams]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!newPassword || !confirmPassword) {
            setError("Please enter and confirm your password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
                data: {
                    password_set: true,  // Mark password as set for future auth checks
                }
            });

            if (updateError) {
                throw updateError;
            }

            // Success - redirect to dashboard
            window.location.href = '/';
        } catch (err: any) {
            console.error("Password setup error:", err);
            setError(err?.message || "Failed to set password. Please try again.");
            setIsSubmitting(false);
        }
    }

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-zinc-400 animate-pulse">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
            <div className="w-full max-w-md p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/40 shadow-lg">
                <h1 className="text-2xl font-bold mb-2">Set Up Your Password</h1>
                <p className="text-sm text-zinc-400 mb-6">
                    Please create a password for your account to continue.
                </p>

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <label className="flex flex-col text-sm">
                        <span className="mb-1 text-zinc-400">New Password</span>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm outline-none focus:ring-1 focus:ring-zinc-600"
                            placeholder="Enter your new password"
                            disabled={isSubmitting}
                        />
                    </label>

                    <label className="flex flex-col text-sm">
                        <span className="mb-1 text-zinc-400">Confirm Password</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm outline-none focus:ring-1 focus:ring-zinc-600"
                            placeholder="Confirm your new password"
                            disabled={isSubmitting}
                        />
                    </label>

                    {error && <div className="text-rose-400 text-sm">{error}</div>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 bg-emerald-500 text-black rounded font-bold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Setting up password..." : "Set Password"}
                    </button>
                </form>

                <div className="mt-6 p-3 rounded bg-zinc-800/50 border border-zinc-700/50">
                    <p className="text-xs text-zinc-400">
                        <strong className="text-zinc-300">Password requirements:</strong>
                        <br />
                        • At least 8 characters long
                        <br />
                        • Cannot be skipped - required to access the dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}
