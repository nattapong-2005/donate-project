import { verifySessionToken } from './services/userService';
import { UserSession } from './types/database';

/**
 * Extract admin_session cookie from a Request
 */
export function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith('admin_session=')) {
      return decodeURIComponent(cookie.substring('admin_session='.length));
    }
  }
  return null;
}

/**
 * Get authenticated user session if valid, otherwise null
 */
export function getAuthenticatedUser(request: Request): UserSession | null {
  // 1. Check admin_session cookie
  const cookieToken = getSessionCookie(request);
  if (cookieToken) {
    const session = verifySessionToken(cookieToken);
    if (session) return session;
  }

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7).trim();
    const session = verifySessionToken(bearerToken);
    if (session) return session;

    // Fallback if Bearer token matches ADMIN_SECRET
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret && bearerToken === adminSecret) {
      return {
        userId: '00000000-0000-0000-0000-000000000001',
        username: 'admin',
        displayName: 'Super Admin',
        role: 'admin',
        expiresAt: Math.floor(Date.now() / 1000) + 86400
      };
    }
  }

  // 3. Check x-admin-token header
  const customHeader = request.headers.get('x-admin-token');
  if (customHeader) {
    const session = verifySessionToken(customHeader);
    if (session) return session;

    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret && customHeader === adminSecret) {
      return {
        userId: '00000000-0000-0000-0000-000000000001',
        username: 'admin',
        displayName: 'Super Admin',
        role: 'admin',
        expiresAt: Math.floor(Date.now() / 1000) + 86400
      };
    }
  }

  return null;
}

/**
 * Admin Security Authentication Helper
 * Validates request via session cookie, bearer token, or secret header
 */
export function verifyAdminAuth(request: Request): boolean {
  const adminSecret = process.env.ADMIN_SECRET;

  // Check if session token or valid bearer is present
  const user = getAuthenticatedUser(request);
  if (user) {
    return true;
  }

  // If no admin secret is configured at all in env, allow access
  if (!adminSecret || adminSecret.trim() === '') {
    return true;
  }

  return false;
}
