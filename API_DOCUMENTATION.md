# API Routes Documentation

## Overview

All API routes implement role-based access control (RBAC), audit logging, and tenant isolation. Routes have development mode fallback for testing without authentication.

---

## Read Endpoints

### GET /api/dashboard

Returns dashboard metrics filtered by user role.

**Role-Based Filtering:**
- **Admin**: All events across all departments
- **Manager**: Events in their department only
- **Agent**: Events assigned to them only

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "created_at": "timestamp",
      "handled_by": "ai|human",
      ...
    }
  ]
}
```

**Audit Logging:** ✅ Logs access with event count

---

### GET /api/emails

Returns email events filtered by user role.

**Role-Based Filtering:**
- **Admin**: All events
- **Manager**: Events in their department
- **Agent**: Events assigned to them

**Response:**
```json
{
  "data": [...]
}
```

**Audit Logging:** ✅ Logs access with event count

---

### GET /api/escalations

Returns escalated events (state = 'needs_attention').

**Role-Based Filtering:**
- **Admin**: All escalations
- **Manager**: Escalations in their department
- **Agent**: ❌ Forbidden (403)

**Permission Check:** `canViewDepartmentEscalations(role)`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "summary": "string",
      "reason": "string",
      "priority": "critical|high|medium|low",
      "department": "string",
      "assignedTo": "string",
      "escalatedAt": "Date",
      "slaDeadline": "Date",
      "confidence": 0.0-1.0,
      "aiReason": "string"
    }
  ]
}
```

**Audit Logging:** ✅ Logs access with escalation count

---

## Write Endpoints

### POST /api/events/assign

Assigns an event to a user.

**Permission Required:** `canAssignEvents(role)` - Manager or Admin only

**Request Body:**
```json
{
  "eventId": "uuid",
  "assignedUserId": "uuid"
}
```

**Role-Based Logic:**
- **Admin**: Can assign any event
- **Manager**: Can only assign events in their department
- **Agent**: ❌ Forbidden (403)

**Response:**
```json
{
  "data": {...},
  "message": "Event assigned successfully"
}
```

**Audit Logging:** ✅ Logs write action with assignment details

---

## Development Mode

When `NEXT_PUBLIC_DEV_MODE=true` and authentication fails:
- All routes return unfiltered data
- Audit logging is skipped
- Permission checks are bypassed
- Console warning: "Auth failed, returning all data (dev mode)"

**⚠️ Production:** Set `NEXT_PUBLIC_DEV_MODE=false` to enforce authentication

---

## Tenant Isolation

All routes filter by `tenant_id` to ensure multi-tenant data isolation:

```typescript
query = query.eq('tenant_id', user.tenant_id);
```

---

## Audit Logging

Every API call logs:
- `user_id` - Who accessed the data
- `user_role` - Their role at time of access
- `action` - read/write/delete
- `resource_type` - email_event/escalation/user/etc
- `resource_id` - Specific resource or "all"
- `endpoint` - API route called
- `ip_address` - Request IP
- `user_agent` - Browser/client info
- `metadata` - Additional context (count, filters, etc)

**Query Audit Logs:**
```typescript
import { getAuditLogs } from '@/lib/audit';

// Get logs for a specific resource
const logs = await getAuditLogs('email_event', eventId);

// Get logs for a specific user
const userLogs = await getUserAuditLogs(userId);
```

---

## Error Responses

**401 Unauthorized:**
```json
{ "error": "Unauthorized" }
```

**403 Forbidden:**
```json
{ "error": "Forbidden: Insufficient permissions" }
```

**400 Bad Request:**
```json
{ "error": "Missing required fields" }
```

**500 Internal Server Error:**
```json
{ "error": "Internal Server Error" }
```

---

## Adding New Routes

1. **Import dependencies:**
```typescript
import { getAuthenticatedUser } from "@/middleware/auth";
import { permissions } from "@/lib/permissions";
import { logAccess } from "@/lib/audit";
```

2. **Authenticate user:**
```typescript
const user = await getAuthenticatedUser(request);
```

3. **Check permissions:**
```typescript
if (!permissions.canDoSomething(user.role)) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

4. **Apply role-based filtering:**
```typescript
if (user.role === 'agent') {
  query = query.eq('assigned_user_id', user.id);
} else if (user.role === 'manager') {
  query = query.eq('department_id', user.department_id);
}
query = query.eq('tenant_id', user.tenant_id);
```

5. **Log access:**
```typescript
await logAccess({
  userId: user.id,
  userRole: user.role,
  action: 'read',
  resourceType: 'email_event',
  resourceId: 'all',
  endpoint: '/api/your-route',
  request,
});
```

---

## Database Requirements

Before deploying, run these migrations:

1. **`create_users_table.sql`** - Users table with RBAC fields
2. **`create_audit_logs.sql`** - Audit logging table
3. **Row-Level Security (RLS)** - Enable on all tables

See `database/migrations/` for SQL scripts.
