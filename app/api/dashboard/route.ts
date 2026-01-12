import { createRequestClient } from "@/lib/supabase/server-client";
import { getAuthenticatedUserFromRequest, AuthError } from "@/middleware/auth";
import { logAccess } from "@/lib/audit";

/**
 * GET /api/dashboard
 * 
 * Returns dashboard metrics filtered by user role:
 * - Admin: All events across all tenants/departments
 * - Manager: Events in their department only
 * - Agent: Events assigned to them only
 */
export async function GET(request: Request) {
    try {
        const user = await getAuthenticatedUserFromRequest(request);
        const supabase = createRequestClient(user.accessToken);

        // Build query based on role
        let query = supabase.from('email_events').select('*');

        // Apply role-based filters
        if (user.role === 'agent') {
            // Agents only see events assigned to them
            query = query.eq('assigned_user_id', user.id);
        } else if (user.role === 'manager') {
            // Managers see events in their department
            if (user.department_id) {
                query = query.eq('department_id', user.department_id);
            }
        }
        // Admins see all events (no filter)

        // Always filter by tenant for multi-tenancy
        query = query.eq('tenant_id', user.tenant_id);

        // Execute query
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        // Log access for audit trail
        await logAccess({
            userId: user.id,
            userRole: user.role,
            action: 'read',
            resourceType: 'email_event',
            resourceId: 'dashboard',
            endpoint: '/api/dashboard',
            request,
            tenantId: user.tenant_id,
            metadata: {
                count: data.length,
                role: user.role,
            },
        });

        return Response.json({ data }, { status: 200 });
    } catch (error) {
        if (error instanceof AuthError) {
            return Response.json({ error: error.message }, { status: error.status });
        }
        console.error('Dashboard API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
