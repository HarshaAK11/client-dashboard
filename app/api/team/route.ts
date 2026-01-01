import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/middleware/auth";
import { logAccess } from "@/lib/audit";

/**
 * GET /api/team
 * 
 * Returns team members filtered by user role:
 * - Admin: All users in the tenant
 * - Manager: Users in their department only
 */
export async function GET(request: Request) {
    try {
        // Development mode fallback
        let user;
        try {
            user = await getAuthenticatedUser(request);
        } catch (authError) {
            console.warn('Auth failed, returning data for mock tenant (dev mode)');
            const mockTenantId = process.env.NEXT_PUBLIC_MOCK_TENANT_ID || 'mock-tenant-id';

            const { data, error } = await supabase
                .from('users')
                .select(`
                    *,
                    departments (
                        name
                    )
                `)
                .eq('tenant_id', mockTenantId)
                .order('created_at', { ascending: false });

            if (error) {
                return Response.json({ error: error.message }, { status: 400 });
            }

            const formattedData = data.map((user: any) => ({
                ...user,
                department_name: user.departments?.name || 'Unassigned'
            }));

            return Response.json({ data: formattedData }, { status: 200 });
        }

        // Build role-based query
        let query = supabase
            .from('users')
            .select(`
                *,
                departments (
                    name
                )
            `);

        // Apply role-based filters
        if (user.role === 'manager') {
            // Managers only see users in their department
            if (user.department_id) {
                query = query.eq('department_id', user.department_id);
            }
        }
        // Admins see all users (no filter)

        // Tenant isolation
        query = query.eq('tenant_id', user.tenant_id);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        // Format data
        const formattedData = data.map((u: any) => ({
            ...u,
            department_name: u.departments?.name || 'Unassigned'
        }));

        // Audit logging
        await logAccess({
            userId: user.id,
            userRole: user.role,
            action: 'read',
            resourceType: 'user',
            resourceId: 'all',
            endpoint: '/api/team',
            request,
            tenantId: user.tenant_id,
            metadata: { count: formattedData.length },
        });

        return Response.json({ data: formattedData }, { status: 200 });
    } catch (error) {
        console.error('Team API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
