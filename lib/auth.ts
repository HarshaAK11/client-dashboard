import { supabaseServerClient } from "./supabase/server"
import { cookies } from "next/headers"

export interface AuthUser {
  id: string
  email: string
  tenant_id: string
  department_id: string
  name?: string
  role?: string
}

/**
 * Get the authenticated user with their tenant information
 * Use this in API routes to get user context
 * 
 * @throws Error if user is not authenticated or profile not found
 * @returns AuthUser object with id, email, tenant_id, and name
 */
export async function getAuthUser(): Promise<AuthUser> {
  try {
    // Create Supabase client (handles session from cookies internally)
    const supabase = await supabaseServerClient()

    const { error: refreshError } = await supabase.auth.refreshSession()

    if (refreshError) {
      throw new Error("Session expired")
    }

    // Get the authenticated user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get the user's profile to get their tenant_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      throw new Error('User profile not found')
    }

    return {
      id: user.id,
      email: user.email || '',
      tenant_id: userProfile.tenant_id,
      name: userProfile.full_name,
      role: userProfile.role,
      department_id: userProfile.department_id,
    }
  } catch (error) {
    console.error('Get auth user error:', error)
    throw error
  }
}

export async function getAuthUserOrError(): Promise<
  { user: AuthUser } | { error: string; status: number }
> {
  try {
    const user = await getAuthUser()
    return { user }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      error: 'Unauthorized',
      status: 401
    }
  }
}