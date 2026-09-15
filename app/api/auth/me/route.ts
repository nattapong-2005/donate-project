import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = getAuthenticatedUser(request);

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'ไม่ได้เข้าสู่ระบบหรือเซสชันหมดอายุ'
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    expiresAt: session.expiresAt,
    user: {
      userId: session.userId,
      username: session.username,
      displayName: session.displayName,
      role: session.role
    }
  });
}
