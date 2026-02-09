import { supabaseServerClient } from '@/lib/supabase/server';
import { supabaseClient } from '@/lib/supabase/client';

/**
 * Access Audit Logging System
 * 
 * Logs all data access for compliance and security.
 * Answers the question: "Who saw this email?"
 */

export interface AuditLog {
    id?: string;
    user_id: string;
    user_role: string;
    action: 'read' | 'write' | 'delete' | 'update';
    resource_type: 'email_event' | 'escalation' | 'user' | 'department' | 'tenant';
    resource_id: string;
    endpoint: string;
    ip_address?: string;
    user_agent?: string;
    timestamp?: Date;
    tenant_id: string;
    metadata?: Record<string, any>;
}

/**
 * Log an access event to the audit_logs table
 */
export async function logAccess({
    userId,
    userRole,
    action,
    resourceType,
    resourceId,
    endpoint,
    request,
    tenantId,
    metadata,
}: {
    userId: string;
    userRole: string;
    action: 'read' | 'write' | 'delete';
    resourceType: 'email_event' | 'escalation' | 'user' | 'department' | 'tenant';
    resourceId: string;
    endpoint: string;
    request: Request;
    tenantId: string;
    metadata?: Record<string, any>;
}): Promise<void> {
    try {
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        const auditLog: AuditLog = {
            user_id: userId,
            user_role: userRole,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            endpoint,
            ip_address: ipAddress,
            user_agent: userAgent,
            tenant_id: tenantId,
            metadata,
            timestamp: new Date(),
        };

        // Insert into audit_logs table using admin client to bypass RLS
        const admin = supabaseServerClient();
        const { error } = await (admin || supabaseServerClient())
            .from('audit_logs')
            .insert(auditLog);

        if (error) {
            console.error('Failed to log audit event:', error);
            // Don't throw - audit logging should not break the main flow
        }
    } catch (error) {
        console.error('Error in logAccess:', error);
        // Silently fail - audit logging is important but not critical
    }
}

/**
 * Query audit logs for a specific resource
 */
export async function getAuditLogs(
    resourceType: string,
    resourceId: string,
    limit: number = 50
): Promise<AuditLog[]> {
    try {
        const admin = supabaseServerClient();
        const { data, error } = await (admin || supabaseServerClient())
            .from('audit_logs')
            .select('*')
            .eq('resource_type', resourceType)
            .eq('resource_id', resourceId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data as AuditLog[];
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return [];
    }
}

/**
 * Query audit logs for a specific user
 */
export async function getUserAuditLogs(
    userId: string,
    limit: number = 100
): Promise<AuditLog[]> {
    try {
        const admin = supabaseServerClient();
        const { data, error } = await (admin || supabaseServerClient())
            .from('audit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data as AuditLog[];
    } catch (error) {
        console.error('Error fetching user audit logs:', error);
        return [];
    }
}

export default {
    logAccess,
    getAuditLogs,
    getUserAuditLogs,
};
