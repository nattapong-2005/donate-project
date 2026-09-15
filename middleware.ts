import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const decoded = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length));
  for (let index = 0; index < decoded.length; index++) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

async function hasValidSession(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const validSignature = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(parts[1]),
      new TextEncoder().encode(parts[0])
    );
    if (!validSignature) return false;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
    return payload.role === 'admin' &&
      typeof payload.expiresAt === 'number' &&
      payload.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = await hasValidSession(request.cookies.get('admin_session')?.value);

  if (pathname.startsWith('/admin') || pathname.startsWith('/customizer')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === '/login' && isAuthenticated) {
    const redirect = request.nextUrl.searchParams.get('redirect');
    const target = redirect && /^(\/admin|\/customizer)(\/|$)/.test(redirect)
      ? redirect
      : '/admin';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/customizer/:path*', '/login']
};
