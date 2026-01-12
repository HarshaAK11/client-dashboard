import { NextResponse } from 'next/server';
import { getAuthenticatedUserFromRequest, AuthError } from '@/middleware/auth';
import { createRequestClient } from '@/lib/supabase/server-client';

/**
 * GET /api/auth/post-login
 * 
 * Server-side authorization check after login.
 * Verifies the session, checks if the user is provisioned in the database,
 * and checks if they have a password set.
 */
export async function GET(request: Request) {
    try {
        // 1. Authenticate using the central guard
        // This ensures the token is valid AND the user is provisioned in public.users
        const user = await getAuthenticatedUserFromRequest(request);

        // 2. Initialize a user-scoped client to fetch metadata
        const supabase = createRequestClient(user.accessToken);

        // 3. Fetch the full auth user object to access metadata
        // Note: We use the user-scoped client here, NOT the admin client.
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return NextResponse.json({ error: 'Session verification failed' }, { status: 401 });
        }

        // 4. Check password existence via metadata
        // Invited users (no password yet):
        //   - Have user_metadata.invited_at set by inviteUserByEmail()
        //   - Do NOT have user_metadata.password_set
        const isInvitedWithoutPassword =
            authUser.user_metadata?.invited_at &&
            !authUser.user_metadata?.password_set;

        const hasPassword = !isInvitedWithoutPassword;

        return NextResponse.json({
            ok: true,
            hasPassword,
            email: user.email
        });

    } catch (error: any) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('Post-login check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
