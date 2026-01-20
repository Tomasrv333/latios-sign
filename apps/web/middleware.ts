import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth');

    // 1. If trying to access Dashboard without token -> Redirect to Login
    if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 2. If trying to access Login WITH token -> Redirect to Dashboard
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 3. Root path -> Redirect to Dashboard (which will then redirect to Login if needed)
    if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/auth/:path*'],
};
