import { NextRequest, NextResponse } from "next/server";

const authRoutes = ['/login', '/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get access to token from cookies
  const token = request.cookies.get('sb-access-token')?.value

  // If user is at root, redirect to dashboard (which will then be handled by the logic below)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user has token and tries to access auth routes, redirect to dashboard
  if (token && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user doesn't have token and tries to access protected routes, redirect to login
  // Protecting everything under /dashboard
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/reset-password|forgot-password).*)',
  ],
}