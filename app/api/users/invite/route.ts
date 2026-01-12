import { createRequestClient } from '@/lib/supabase/server-client';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getAuthenticatedUserFromRequest, requireRole, AuthError } from '@/middleware/auth';
import { logAccess } from '@/lib/audit';

/**
 * POST /api/users/invite
 * 
 * Invite a new user to the platform.
 * - Admin: Can invite users to any department
 * - Manager: Can only invite users to their own department
 * 
 * Uses Supabase Auth Admin API to send invitation email.
 * User will set their own password via the invitation link.
 */
export async function POST(request: Request) {
    try {
        // Authenticate the requesting user
        const authenticatedUser = await getAuthenticatedUserFromRequest(request);
        const supabase = createRequestClient(authenticatedUser.accessToken);

        // Only admins and managers can invite users
        if (!requireRole(authenticatedUser, ['admin', 'manager'])) {
            return Response.json(
                { error: 'Forbidden: Only admins and managers can invite users' },
                { status: 403 }
            );
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

        // Role-based authorization checks
        if (authenticatedUser.role === 'manager') {
            // Managers can only invite to their own department
            if (!authenticatedUser.department_id) {
                return Response.json(
                    { error: 'Manager must be assigned to a department to invite users' },
                    { status: 400 }
                );
            }

            if (department_id && department_id !== authenticatedUser.department_id) {
                return Response.json(
                    { error: 'Managers can only invite users to their own department' },
                    { status: 403 }
                );
            }

            // Managers cannot invite admins
            if (role === 'admin') {
                return Response.json(
                    { error: 'Managers cannot invite admin users' },
                    { status: 403 }
                );
            }
        }

        // Check if user already exists using admin client to bypass RLS
        const admin = getSupabaseAdmin();
        const { data: existingUser } = await (admin || supabase)
            .from('users')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .eq('tenant_id', authenticatedUser.tenant_id)
            .single();

        if (existingUser) {
            return Response.json(
                { error: 'A user with this email already exists in your organization' },
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
                    tenant_id: authenticatedUser.tenant_id,
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

        // Create user record in public.users table using admin client
        const { data: newUser, error: userError } = await (admin || supabase)
            .from('users')
            .insert({
                id: authUser.user.id,
                email: email.toLowerCase(),
                full_name,
                role,
                tenant_id: authenticatedUser.tenant_id,
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

        // Audit log
        await logAccess({
            userId: authenticatedUser.id,
            userRole: authenticatedUser.role,
            action: 'write',
            resourceType: 'user',
            resourceId: newUser.id,
            endpoint: '/api/users/invite',
            request,
            tenantId: authenticatedUser.tenant_id,
            metadata: {
                invited_email: email,
                invited_role: role,
                invited_department_id: department_id,
            },
        });

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
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('Invite user error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}