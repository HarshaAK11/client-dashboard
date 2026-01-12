"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/UserContext";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Initialize browser client for the login page guard
const supabase = createSupabaseBrowserClient();
import { isDevMode } from "@/lib/dev-auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDev = isDevMode;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Authenticate via UserContext (which uses Supabase)
      await signIn(email, password);

      // Success - redirect to auth callback
      // Do NOT redirect to / or /dashboard
      router.push('/auth/callback');

    } catch (err: any) {
      console.error("Login error:", err);

      // Classify and display error
      const errorMessage = classifyAuthError(err);
      setError(errorMessage);

      setIsSubmitting(false);
    }
  }

  // GUARD: Redirect to dashboard if already authenticated
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  function classifyAuthError(error: any): string {
    const message = String(error?.message || '').toLowerCase();

    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password';
    }

    if (message.includes('email not confirmed')) {
      return 'Please confirm your email address';
    }

    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout')
    ) {
      return 'Service unavailable. Please try again.';
    }

    return 'Login failed. Please try again.';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/40 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Sign in</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Sign in with your email and password to access the dashboard.
        </p>

        {isDev && (
          <div className="mb-4 p-3 rounded bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-500 font-medium">
              🔧 Dev Mode Active
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-zinc-400">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null); // Clear error on input
              }}
              className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm outline-none focus:ring-1 focus:ring-zinc-600"
              placeholder="you@example.com"
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-zinc-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null); // Clear error on input
              }}
              className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm outline-none focus:ring-1 focus:ring-zinc-600"
              placeholder="Your password"
              disabled={isSubmitting}
              autoComplete="current-password"
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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/reset-password"
            className="text-sm text-zinc-400 hover:text-zinc-50 transition"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
