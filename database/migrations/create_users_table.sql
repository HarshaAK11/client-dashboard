-- Migration: Create or update users table for RBAC
-- Purpose: Ensure users table has all required fields for role-based access control
-- Date: 2025-12-24

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'agent')),
    tenant_id UUID NOT NULL,
    department_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Add comments
COMMENT ON TABLE public.users IS 'User profiles with role-based access control';
COMMENT ON COLUMN public.users.role IS 'User role: admin, manager, or agent';
COMMENT ON COLUMN public.users.tenant_id IS 'Tenant ID for multi-tenancy isolation';
COMMENT ON COLUMN public.users.department_id IS 'Department ID for managers and agents';

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (id = auth.uid());

-- RLS Policy: Admins can view all users in their tenant
CREATE POLICY "Admins can view all users in tenant"
ON public.users
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users AS u
        WHERE u.id = auth.uid()
        AND u.role = 'admin'
        AND u.tenant_id = users.tenant_id
    )
);

-- RLS Policy: Managers can view users in their department
CREATE POLICY "Managers can view department users"
ON public.users
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users AS u
        WHERE u.id = auth.uid()
        AND u.role = 'manager'
        AND u.department_id = users.department_id
    )
);

-- RLS Policy: Only admins can update user roles
CREATE POLICY "Admins can update users"
ON public.users
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users AS u
        WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
