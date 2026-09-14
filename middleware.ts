import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin and /customizer routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/customizer')) {
    const sessionCookie = request.cookies.get('admin_session')?.value;

    let isAuthenticated = false;

    if (sessionCookie && sessionCookie.includes('.')) {
      try {
        const [payloadBase64] = sessionCookie.split('.');
        // Base64url decode
        const jsonStr = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(jsonStr);

        const now = Math.floor(Date.now() / 1000);
        if (payload.expiresAt && payload.expiresAt > now) {
          isAuthenticated = true;
        }
      } catch (e) {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If visiting /login while already authenticated, redirect to /admin
  if (pathname === '/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (sessionCookie && sessionCookie.includes('.')) {
      try {
        const [payloadBase64] = sessionCookie.split('.');
        const jsonStr = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(jsonStr);

        const now = Math.floor(Date.now() / 1000);
        if (payload.expiresAt && payload.expiresAt > now) {
          const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/admin';
          return NextResponse.redirect(new URL(redirectTarget, request.url));
        }
      } catch (e) {}
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/customizer/:path*', '/login']
};
