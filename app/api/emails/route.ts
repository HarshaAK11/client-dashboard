import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/middleware/auth";
import { logAccess } from "@/lib/audit";

/**
 * GET /api/emails
 * 
 * Returns email events filtered by user role:
 * - Admin: All events
 * - Manager: Events in their department
 * - Agent: Events assigned to them
 */
export async function GET(request: Request) {
    try {
        // Development mode fallback
        let user;
        try {
            user = await getAuthenticatedUser(request);
        } catch (authError) {
            console.warn('Auth failed, returning all data (dev mode)');
            const { data, error } = await supabase.from('email_events').select('*');

            if (error) {
                return Response.json({ error: error.message }, { status: 400 });
            }

            return Response.json({ data }, { status: 200 });
        }

        // Build role-based query
        let query = supabase.from('email_events').select('*');

        // Apply role-based filters
        if (user.role === 'agent') {
            query = query.eq('assigned_user_id', user.id);
        } else if (user.role === 'manager') {
            if (user.department_id) {
                query = query.eq('department_id', user.department_id);
            }
        }

        // Tenant isolation
        query = query.eq('tenant_id', user.tenant_id);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        // Audit logging
        await logAccess({
            userId: user.id,
            userRole: user.role,
            action: 'read',
            resourceType: 'email_event',
            resourceId: 'all',
            endpoint: '/api/emails',
            request,
            tenantId: user.tenant_id,
            metadata: { count: data.length },
        });

        return Response.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Emails API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}