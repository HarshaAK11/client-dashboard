import { Role } from '@/types/user';

/**
 * Role-Based Permission System
 * 
 * Explicitly defines both READ and WRITE permissions to prevent authority leaks.
 * All permissions are checked at both UI and API levels.
 */

// ============================================================================
// READ PERMISSIONS
// ============================================================================

export const canViewGlobalMetrics = (role: Role): boolean => {
    return role === 'admin';
};

export const canViewDepartmentMetrics = (role: Role): boolean => {
    return ['admin', 'manager'].includes(role);
};

export const canViewAllEscalations = (role: Role): boolean => {
    return role === 'admin';
};

export const canViewDepartmentEscalations = (role: Role): boolean => {
    return ['admin', 'manager'].includes(role);
};

export const canViewTeamWorkload = (role: Role): boolean => {
    return ['admin', 'manager'].includes(role);
};

export const canViewAnalytics = (role: Role): boolean => {
    return ['admin', 'manager'].includes(role);
};

export const canViewTeamManagement = (role: Role): boolean => {
    return ['admin', 'manager'].includes(role);
};

// ============================================================================
// WRITE PERMISSIONS - Explicitly Defined
// ============================================================================

export const canAssignEvents = (role: Role): boolean => {
    return ['admin', 'manager'].includes(role);
};

export const canReassignEvents = (role: Role): boolean => {
    return ['admin', 'manager'].includes(role);
};

export const canOverrideAI = (role: Role): boolean => {
    return ['admin', 'manager'].includes(role);
};

export const canManageUsers = (role: Role): boolean => {
    return role === 'admin';
};

export const canEditDepartments = (role: Role): boolean => {
    return role === 'admin';
};

export const canDeleteEvents = (role: Role): boolean => {
    return role === 'admin';
};

export const canModifyTenantSettings = (role: Role): boolean => {
    return role === 'admin';
};

export const canCreateDepartments = (role: Role): boolean => {
    return role === 'admin';
};

export const canDeleteUsers = (role: Role): boolean => {
    return role === 'admin';
};

// ============================================================================
// AGENT WRITE PERMISSIONS
// ============================================================================

export const canReplyToAssignedEvents = (role: Role): boolean => {
    return true; // All roles can reply to events
};

export const canMarkEventResolved = (
    role: Role,
    event: { assigned_user_id?: string; department_id?: string },
    userId: string,
    userDepartmentId?: string
): boolean => {
    if (role === 'admin') return true;

    if (role === 'manager') {
        // Managers can resolve events in their department
        return event.department_id === userDepartmentId;
    }

    // Agents can only resolve their own assigned events
    return event.assigned_user_id === userId;
};

export const canEditEventNotes = (
    role: Role,
    event: { assigned_user_id?: string; department_id?: string },
    userId: string,
    userDepartmentId?: string
): boolean => {
    if (role === 'admin') return true;

    if (role === 'manager') {
        return event.department_id === userDepartmentId;
    }

    return event.assigned_user_id === userId;
};

// ============================================================================
// COMPOSITE PERMISSIONS (for convenience)
// ============================================================================

export const permissions = {
    // Read
    canViewGlobalMetrics,
    canViewDepartmentMetrics,
    canViewAllEscalations,
    canViewDepartmentEscalations,
    canViewTeamWorkload,
    canViewAnalytics,
    canViewTeamManagement,

    // Write
    canAssignEvents,
    canReassignEvents,
    canOverrideAI,
    canManageUsers,
    canEditDepartments,
    canDeleteEvents,
    canModifyTenantSettings,
    canCreateDepartments,
    canDeleteUsers,

    // Agent Write
    canReplyToAssignedEvents,
    canMarkEventResolved,
    canEditEventNotes,
};

export default permissions;
