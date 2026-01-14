import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/users/invite
 * 
 * Invite a new user to the platform in public mode.
 * Uses the mock tenant ID from environment variables.
 */
export async function POST(request: Request) {
    try {
        const supabase = createSupabaseBrowserClient();
        const tenantId = process.env.NEXT_PUBLIC_MOCK_TENANT_ID;

        if (!tenantId) {
            return Response.json({ error: 'Tenant ID not configured' }, { status: 500 });
        }

        // Parse request body
        const body = await request.json();
        const { email, full_name, role, department_id } = body;

        // Validation
        if (!email || !full_name) {
            return Response.json(
                { error: 'Email and full name are required' },
                { status: 400 }
            );
        }

        if (!role || !['admin', 'manager', 'agent'].includes(role)) {
            return Response.json(
                { error: 'Invalid role. Must be admin, manager, or agent' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const admin = getSupabaseAdmin();
        const { data: existingUser } = await (admin || supabase)
            .from('users')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .eq('tenant_id', tenantId)
            .single();

        if (existingUser) {
            return Response.json(
                { error: 'A user with this email already exists in this organization' },
                { status: 409 }
            );
        }

        if (!admin) {
            console.error('Missing Supabase admin credentials');
            return Response.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Invite user via Supabase Auth Admin API
        const { data: authUser, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
            email.toLowerCase(),
            {
                data: {
                    full_name,
                    role,
                    tenant_id: tenantId,
                    department_id: department_id || null,
                },
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
            }
        );

        if (inviteError) {
            console.error('Supabase invite error:', inviteError);
            return Response.json(
                { error: inviteError.message || 'Failed to send invitation' },
                { status: 400 }
            );
        }

        if (!authUser?.user) {
            return Response.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // Create user record in public.users table
        const { data: newUser, error: userError } = await (admin || supabase)
            .from('users')
            .insert({
                id: authUser.user.id,
                email: email.toLowerCase(),
                full_name,
                role,
                tenant_id: tenantId,
                department_id: department_id || null,
            })
            .select()
            .single();

        if (userError) {
            console.error('Error creating user record:', userError);
            // Rollback: Delete the auth user if we couldn't create the profile
            await admin.auth.admin.deleteUser(authUser.user.id);
            return Response.json(
                { error: 'Failed to create user profile' },
                { status: 500 }
            );
        }

        return Response.json(
            {
                success: true,
                message: 'Invitation sent successfully',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    full_name: newUser.full_name,
                    role: newUser.role,
                    department_id: newUser.department_id,
                },
            },
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