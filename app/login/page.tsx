"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect already-signed-in users away from /login to the dashboard
  React.useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setIsSigningIn(true);
    try {
      await signIn(email, password);
      // Redirect to root (dashboard)
      router.push("/");
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err?.message || "Sign in failed. Please check credentials.");
      setIsSigningIn(false);
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md p-8 rounded-lg border border-zinc-800/50 bg-zinc-900/40 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Sign in</h1>
        <p className="text-sm text-zinc-400 mb-6">Sign in with email and password to access the dashboard.</p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-zinc-400">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm outline-none focus:ring-1 focus:ring-zinc-600"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-zinc-400">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-sm outline-none focus:ring-1 focus:ring-zinc-600"
              placeholder="Your password"
            />
          </label>

          {error && <div className="text-rose-400 text-sm">{error}</div>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSigningIn}
              className="flex-1 px-4 py-2 bg-emerald-500 text-black rounded font-bold hover:bg-emerald-600 transition"
            >
              {isSigningIn ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => { setEmail(""); setPassword(""); setError(null); }}
              className="px-3 py-2 rounded border border-zinc-700 text-sm hover:bg-zinc-800/50 transition"
            >
              Clear
            </button>
          </div>



        </form>


      </div>
    </div>
  );
}
