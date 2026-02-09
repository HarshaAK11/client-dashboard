import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function supabaseServerClient(options?: { token?: string; admin?: boolean }) {
  const cookieStore = await cookies()
  const token = options?.token || cookieStore.get('sb-access-token')?.value

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = options?.admin
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        headers: (token && !options?.admin) ? { Authorization: `Bearer ${token}` } : undefined,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            console.error('Failed to set cookies')
          }
        },
      },
    }
  )
}