import { NextResponse } from 'next/server';
import { authenticateUser, SESSION_MAX_AGE_SECONDS } from '@/lib/services/userService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      );
    }

    const { user, token } = await authenticateUser(username, password);

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role
      },
      token
    });

    // Set HTTP-only session cookie (valid for 1 hour)
    const isProduction = process.env.NODE_ENV === 'production';
    const maxAge = SESSION_MAX_AGE_SECONDS; // 1 hour (3600 seconds)

    response.cookies.set('admin_session', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'การเข้าสู่ระบบล้มเหลว' },
      { status: 401 }
    );
  }
}
