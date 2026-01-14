"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // TEMP AUTH WORKAROUND – REMOVE BEFORE MULTI-USER / PROD SCALE
            const response = await fetch('/api/auth/temp-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Log in</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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
                        className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all duration-200"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-medium text-zinc-400" htmlFor="password">
                            Password
                        </label>
                        {/* TEMP AUTH WORKAROUND: Forgot password disabled */}
                        <span className="text-xs text-zinc-600 cursor-default">
                            Recovery unavailable
                        </span>
                    </div>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all duration-200"
                    />
                </div>

                {error && (
                    <div className="p-3 text-sm bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg animate-shake">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                    ) : (
                        <span>Sign In</span>
                    )}
                </button>
            </form>
        </div>
    );
}


