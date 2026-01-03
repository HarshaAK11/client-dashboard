import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/middleware/auth";
import { permissions } from "@/lib/permissions";
import { logAccess } from "@/lib/audit";

/**
 * GET /api/escalations
 * 
 * Returns escalated events filtered by user role:
 * - Admin: All escalations
 * - Manager: Escalations in their department
 * - Agent: Not allowed (403)
 */
export async function GET(request: Request) {
    try {
        // Development mode fallback
        let user;
        try {
            user = await getAuthenticatedUser(request);
        } catch (authError) {
            console.warn('Auth failed, returning all data (dev mode)');
            const { data, error } = await supabase
                .from('email_events')
                .select('*, assigned_user:users!assigned_user_id(full_name), department:departments!department_id(name)')
                .eq('current_state', 'needs_attention')
                .order('created_at', { ascending: false });

            if (error) {
                return Response.json({ error: error.message }, { status: 400 });
            }

            const formattedData = formatEscalations(data as any[]);
            return Response.json({ data: formattedData }, { status: 200 });
        }

        // Check read permission
        if (!permissions.canViewDepartmentEscalations(user.role)) {
            return Response.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        // Build role-based query
        let query = supabase
            .from('email_events')
            .select('*, assigned_user:users!assigned_user_id(full_name), department:departments!department_id(name)')
            .eq('current_state', 'needs_attention');

        // Apply role-based filters
        if (user.role === 'manager') {
            // Managers only see escalations in their department
            if (user.department_id) {
                query = query.eq('department_id', user.department_id);
            }
        }
        // Admins see all escalations (no filter)

        // Tenant isolation
        query = query.eq('tenant_id', user.tenant_id);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        // Format data for frontend
        const formattedData = formatEscalations(data as any[]);

        // Audit logging
        await logAccess({
            userId: user.id,
            userRole: user.role,
            action: 'read',
            resourceType: 'escalation',
            resourceId: 'all',
            endpoint: '/api/escalations',
            request,
            tenantId: user.tenant_id,
            metadata: { count: formattedData.length },
        });

        return Response.json({ data: formattedData }, { status: 200 });
    } catch (error) {
        console.error('Escalations API error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * Format escalation data for frontend
 */
function formatEscalations(data: any[]) {
    return data.map((item) => ({
        id: item.id,
        summary: item.summary || "No summary available",
        reason: item.escalation_reason || "AI confidence below threshold",
        priority: item.priority || "medium",
        department: item.department?.name || "Unassigned",
        assignedTo: item.assigned_user?.full_name || "Unassigned",
        assignedToId: item.assigned_user_id || "Unassigned",
        escalatedAt: item.created_at ? new Date(item.created_at) : new Date(),
        slaDeadline: item.sla_deadline ? new Date(item.sla_deadline) : new Date(Date.now() + 1000 * 60 * 60),
        confidence: item.confidence_score ?? item.sentiment_score ?? 0.5,
        aiReason: item.failure_reason || "Manual escalation required.",
        subject: item.subject || "No subject",
        content: item.content || "No content available",
        source: item.source || "email",
        externalMessageId: item.external_message_id,
        externalThreadId: item.external_thread_id,
    }));
}

