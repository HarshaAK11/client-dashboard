"use client";

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase/client';

function getHashParams() {
  const hash = window.location.hash.substring(1)
  return Object.fromEntries(new URLSearchParams(hash))
}

export default function CallbackPage() {
    const router = useRouter()
    const supabase = createSupabaseBrowser()

    useEffect(() => {
    const handleInviteCallback = async () => {

      const {
        access_token,
        refresh_token,
      } = getHashParams()

      if (!access_token || !refresh_token) {
        router.replace("/login")
        return
      }

      // 🔑 THIS IS THE CRITICAL STEP
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error || !data?.session) {
        router.replace("/login")
        return
      }

      const user = data.session.user

      const hasPassword = user.user_metadata?.has_password === true

      if (!hasPassword) {
        router.replace("/set-password")
      } else {
        router.replace("/dashboard")
      }
    }

    handleInviteCallback()
  }, [])

    return (
        <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-950">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-zinc-800/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-zinc-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

            <div className="relative z-10 w-full px-4 flex flex-col items-center">
                {/* Logo */}
                <div className="mb-12 group cursor-default">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-zinc-50/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={80}
                            height={80}
                            className="relative drop-shadow-2xl"
                        />
                    </div>
                </div>

                <div className="w-full max-w-md p-10 bg-zinc-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-zinc-800/50 shadow-[0_0_100px_-12px_rgba(0,0,0,0.5)] flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-zinc-400/20 blur-2xl rounded-full animate-pulse" />
                        <Loader2 className="w-12 h-12 text-zinc-400 animate-spin relative" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Securely Logging In</h1>
                        <p className="text-zinc-500 text-lg">Finishing up the authentication process...</p>
                    </div>

                    <div className="pt-4 flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-800 animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 rounded-full bg-zinc-800 animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 rounded-full bg-zinc-800 animate-bounce" />
                    </div>
                </div>
            </div>
        </main>
    );
}
