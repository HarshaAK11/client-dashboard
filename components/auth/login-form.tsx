"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
    const router = useRouter();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to login')
                setLoading(false)
                return
            }

            router.push('/dashboard')
            router.refresh()
        } catch (error) {
            setError('Login failed')
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-zinc-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Welcome back</h1>
                <p className="text-zinc-500 text-sm">Enter your credentials to access your dashboard</p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
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

                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-medium text-zinc-400" htmlFor="password">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        <span>Sign In</span>
                    )}
                </button>
            </form>
        </div>
    );
}


