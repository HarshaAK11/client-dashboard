import { redirect } from 'next/navigation';
import { hasDemoSession } from '@/core/auth/session';

export default async function RootPage() {
    const session = await hasDemoSession();
    
    if (session) {
        redirect('/dashboard');
    } else {
        redirect('/login');
    }
}
