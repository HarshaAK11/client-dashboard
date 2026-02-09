import { supabaseServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const supabase = await supabaseServerClient({ admin: true })

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (!data.session) {
            return NextResponse.json({ error: "Session not found" }, { status: 400 });
        }

        const response = NextResponse.json(
            {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                }
            },
            { status: 200 }
        )

        response.cookies.set({
            name: 'sb-access-token',
            value: data.session.access_token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return response
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        );
    }
}