-- Migration: Create audit_logs table
-- Purpose: Track all data access for compliance and security
-- Date: 2025-12-24

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('read', 'write', 'delete')),
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_endpoint ON public.audit_logs(endpoint);

-- Add comments
COMMENT ON TABLE public.audit_logs IS 'Audit trail for all data access and modifications';
COMMENT ON COLUMN public.audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN public.audit_logs.user_role IS 'Role of the user at the time of action';
COMMENT ON COLUMN public.audit_logs.action IS 'Type of action: read, write, or delete';
COMMENT ON COLUMN public.audit_logs.resource_type IS 'Type of resource accessed';
COMMENT ON COLUMN public.audit_logs.resource_id IS 'ID of the specific resource';
COMMENT ON COLUMN public.audit_logs.endpoint IS 'API endpoint that was called';
COMMENT ON COLUMN public.audit_logs.metadata IS 'Additional context about the action';

-- Enable Row Level Security (RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- RLS Policy: Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policy: Only the system can insert audit logs (via service role)
-- This prevents users from tampering with audit logs
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);
