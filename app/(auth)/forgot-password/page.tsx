import ForgotPasswordForm from '@/components/auth/forgot-password-form';
import Image from 'next/image';

export default function ForgotPasswordPage() {
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
                {/* Logo or Brand Name */}
                <div className="flex items-center mb-8 group cursor-default">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-zinc-50/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={64}
                            height={64}
                            className="relative drop-shadow-2xl"
                        />
                    </div>
                </div>

                <ForgotPasswordForm />
            </div>
        </main>
    );
}
