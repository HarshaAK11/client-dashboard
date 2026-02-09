"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {   
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error('Failed to send reset password email');
            }

            setSubmitted(true);
        } catch (err: any) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700">
                <div className="text-center space-y-4">

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Check your email</h1>
                        <p className="text-zinc-500 text-sm">
                            We've sent a password reset link to <span className="text-zinc-300 font-medium">{email}</span>
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

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Forgot password?</h1>
                <p className="text-zinc-500 text-sm">No worries, we'll send you reset instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 ml-1" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl text-zinc-50 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-800/50 focus:border-zinc-700 transition-all duration-300"
                    />
                </div>

                {error && (
                    <div className="p-4 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-4 bg-zinc-50 hover:bg-white text-zinc-950 font-bold rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                    ) : (
                        <span>Send Link</span>
                    )}
                </button>

                <Link
                    href="/login"
                    className="flex items-center justify-center space-x-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span>Back to Login</span>
                </Link>
            </form>
        </div>
    );
}
