import { supabaseServerClient } from '@/lib/supabase/server';
import { getAuthUserOrError } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';

/**
 * POST /api/users/invite
 * 
 * Invite a new user to the platform.
 * Uses the authenticated user's tenant ID.
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await getAuthUserOrError()

        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status })
        }

        const { user } = authResult
        const tenantId = user.tenant_id;

        // Parse request body
        const body = await request.json();
        const { email, full_name, role, department_id } = body;

        const admin = await supabaseServerClient({ admin: true })

        const { data, error } = await admin
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle()

        if (data) {
            return NextResponse.json(
                { error: 'A user with this email already exists in this organization' },
                { status: 409 }
            );
        }

        const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email.toLowerCase(), {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
            data: {
                full_name,
                role,
                tenant_id: tenantId,
                department_id: department_id || null,
            },
        })

        if (inviteError) {
            return NextResponse.json(
                { error: inviteError.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Invitation sent successfully' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Invite user error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}