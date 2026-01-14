import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEMO_SESSION_COOKIE = 'demo_session';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the user is trying to access a protected route
    if (pathname.startsWith('/dashboard')) {
        const session = request.cookies.get(DEMO_SESSION_COOKIE);

        if (!session) {
            // Redirect to login if no session is found
            const url = new URL('/login', request.url);
            return NextResponse.redirect(url);
        }
    }

    // Redirect logged-in users away from login page
    if (pathname === '/login') {
        const session = request.cookies.get(DEMO_SESSION_COOKIE);
        if (session) {
            const url = new URL('/dashboard', request.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
