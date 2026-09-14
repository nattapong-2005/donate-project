import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'ออกจากระบบเรียบร้อยแล้ว'
  });

  // Clear session cookie
  response.cookies.set('admin_session', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0
  });

  return response;
}
