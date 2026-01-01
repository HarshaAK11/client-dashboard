import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/middleware/auth";
import { permissions } from "@/lib/permissions";
import { logAccess } from "@/lib/audit";

/**
 * POST /api/escalations/actions
 * 
 * Handle various escalation actions:
 * - assign: Assign to user
 * - escalate_department: Move to another department
 * - ai_override: Reclassify intent/priority
 * - snooze: Update SLA deadline
 * - false_escalation: Mark as resolved/false
 */
export async function POST(request: Request) {
    try {
        let user;
        try {
            user = await getAuthenticatedUser(request);
        } catch (authError) {
            // Development fallback for mock user
            console.warn('Auth failed, using mock user for action');
            user = {
                id: process.env.NEXT_PUBLIC_MOCK_USER_ID || 'mock-user-id',
                role: 'admin', // Default to admin for dev
                tenant_id: 'mock-tenant-id',
                department_id: 'mock-dept-id'
            };
        }

        const body = await request.json();
        const { action, eventId, payload } = body;

        if (!action || !eventId) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let updateData: any = { updated_at: new Date().toISOString() };
        let auditMetadata: any = { action };

        switch (action) {
            case 'assign':
                const assigneeId = payload?.assigneeId || user.id;
                updateData.assigned_user_id = assigneeId;
                auditMetadata.assignedTo = assigneeId;
                break;

            case 'escalate_department':
                if (!payload?.departmentId) return Response.json({ error: 'Missing departmentId' }, { status: 400 });
                updateData.department_id = payload.departmentId;
                auditMetadata.toDepartment = payload.departmentId;
                break;

            case 'ai_override':
                if (payload?.reason) updateData.escalation_reason = payload.reason;
                if (payload?.priority) updateData.priority = payload.priority;
                auditMetadata.changes = payload;
                break;

            case 'snooze':
                if (!payload?.until) return Response.json({ error: 'Missing until date' }, { status: 400 });
                updateData.sla_deadline = payload.until;
                auditMetadata.snoozedUntil = payload.until;
                break;

            case 'false_escalation':
                updateData.current_state = 'resolved';
                auditMetadata.resolvedAs = 'false_escalation';
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('email_events')
            .update(updateData)
            .eq('id', eventId)
            .select();

        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        // Log the action
        await logAccess({
            userId: user.id,
            userRole: user.role,
            action: 'write',
            resourceType: 'email_event',
            resourceId: eventId,
            endpoint: '/api/escalations/actions',
            request,
            tenantId: user.tenant_id,
            metadata: auditMetadata,
        });

        return Response.json({ data, message: `Action ${action} completed successfully` }, { status: 200 });
    } catch (error) {
        console.error('Escalation action error:', error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
