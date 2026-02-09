"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase/client';

const supabase = createSupabaseBrowser();

export default function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string>('');
    const [isValidToken, setIsValidToken] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
    const validateSession = async () => {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session) {
        setError('Invalid or expired reset link')
        setLoading(false)
        return
        }

        setIsValidToken(true)
        setLoading(false)
    }

    validateSession()
}, [])

    const validatePassword = (): boolean => {
        setError(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword()) {
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) {
                setError("Failed to update password")
                setLoading(false)
                return
            }

            setSubmitted(true);
            setLoading(false);

            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            console.error('Reset password error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                    <p className="text-zinc-500 text-sm">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!isValidToken) {
        return (
            <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                        <AlertCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Invalid Link</h1>
                        <p className="text-zinc-500 text-sm">
                            {error || 'This password reset link is invalid or has expired.'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/forgot-password')}
                    className="w-full py-4 px-4 bg-zinc-50 hover:bg-white text-zinc-950 font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                    <span>Request New Link</span>
                </button>
            </div>
        );
    }

    // Success state
    if (submitted) {
        return (
            <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Password Reset!</h1>
                        <p className="text-zinc-500 text-sm">
                            Your password has been successfully reset. You can now log in with your new password.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/login')}
                    className="w-full py-4 px-4 bg-zinc-50 hover:bg-white text-zinc-950 font-bold rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                    <span>Back to Login</span>
                </button>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Set New Password</h1>
                <p className="text-zinc-500 text-sm">Please enter your new password below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 ml-1" htmlFor="password">
                        New Password
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={submitting}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-800/50 focus:border-zinc-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 ml-1" htmlFor="confirmPassword">
                        Confirm New Password
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                        <input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={submitting}
                            className="w-full pl-11 pr-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-800/50 focus:border-zinc-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-4 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-4 bg-zinc-50 hover:bg-white text-zinc-950 font-bold rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Resetting...</span>
                        </>
                    ) : (
                        <span>Reset Password</span>
                    )}
                </button>
            </form>
        </div>
    );
}