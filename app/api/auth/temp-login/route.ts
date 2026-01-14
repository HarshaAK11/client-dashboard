import { getSupabaseAdmin } from '@/lib/supabase/server';
import { setDemoSession } from '@/core/auth/session';

/**
 * TEMP AUTH WORKAROUND – REMOVE BEFORE MULTI-USER / PROD SCALE
 * 
 * POST /api/auth/login
 * 
 * Simple credential check against temp_auth_users table.
 * Just checks if email and password match - no hashing, no Supabase Auth.
 */
export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return Response.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const admin = getSupabaseAdmin();
        if (!admin) {
            return Response.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Simple check: does this email + password combination exist?
        const { data: user, error } = await admin
            .from('temp_auth_users')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('password', password)
            .single();

        if (error || !user) {
            return Response.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Set a demo session cookie
        await setDemoSession();

        return Response.json({ success: true });
    } catch (error: any) {
        console.error('Login error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}

