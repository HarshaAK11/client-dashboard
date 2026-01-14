import LoginForm from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-zinc-950">

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="relative z-10 w-full px-4 flex flex-col items-center">
                {/* Logo or Brand Name */}
                <div className="flex items-center space-x-3 group cursor-default">
                    <Image src="/full logo.png" alt="Logo" width={128} height={128} />
                </div>

                <LoginForm />
            </div>
        </main>
    );
}

