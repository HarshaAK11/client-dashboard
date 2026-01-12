"use client";

import React, { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Initialize browser client for the reset password page
const supabase = createSupabaseBrowserClient();
import Link from "next/link";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        // Basic email format validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: `${window.location.origin}/auth/reset-callback`,
                }
            );

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err: any) {
            console.error("Password reset error:", err);
            setError("Failed to send reset email. Please try again.");
            setIsSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
                <div className="w-full max-w-md p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/40 shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                    <p className="text-sm text-zinc-400 mb-6">
                        We've sent a password reset link to <strong className="text-zinc-50">{email}</strong>.
                        Please check your inbox and follow the instructions.
                    </p>
                    <Link
                        href="/login"
                        className="block w-full px-4 py-2 bg-emerald-500 text-black rounded font-bold hover:bg-emerald-600 transition text-center"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
            <div className="w-full max-w-md p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/40 shadow-lg">
                <h1 className="text-2xl font-bold mb-2">Reset password</h1>
                <p className="text-sm text-zinc-400 mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label className="flex flex-col text-sm">
                        <span className="mb-1 text-zinc-400">Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(null);
                            }}
                            className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm outline-none focus:ring-1 focus:ring-zinc-600"
                            placeholder="you@example.com"
                            disabled={isSubmitting}
                            autoComplete="email"
                            required
                        />
                    </label>

                    {error && (
                        <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded p-3">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2 bg-emerald-500 text-black rounded font-bold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Sending..." : "Send reset link"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-zinc-400 hover:text-zinc-50 transition"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
