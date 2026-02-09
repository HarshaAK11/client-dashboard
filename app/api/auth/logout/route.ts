import { supabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = await supabaseServerClient();

    // Invalidate the session on the server
    await supabase.auth.signOut();

    const response = NextResponse.json(
        { success: true },
        { status: 200 }
    )

    // Forcefully expire the cookies with matching attributes
    const cookieOptions = {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 0 // Expire immediately
    }

    response.cookies.set('sb-access-token', '', cookieOptions)
    response.cookies.set('sb-refresh-token', '', cookieOptions)

    // Prevent caching of the response
    response.headers.set('Cache-Control', 'no-store, max-age=0')

    return response
}