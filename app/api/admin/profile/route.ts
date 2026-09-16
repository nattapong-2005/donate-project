import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getUserById, updateUserProfile, SESSION_MAX_AGE_SECONDS } from '@/lib/services/userService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/profile
 * ดึงข้อมูลโปรไฟล์ของผู้ดูแลระบบที่ล็อกอินอยู่
 */
export async function GET(request: Request) {
  const session = getAuthenticatedUser(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'ไม่มีสิทธิ์เข้าถึง หรือเซสชันหมดอายุ' },
      { status: 401 }
    );
  }

  try {
    const user = await getUserById(session.userId);

    return NextResponse.json({
      success: true,
      user: {
        id: user?.id || session.userId,
        username: user?.username || session.username,
        displayName: user?.display_name || session.displayName,
        role: user?.role || session.role,
        createdAt: user?.created_at || null,
        updatedAt: user?.updated_at || null
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/profile
 * อัปเดตข้อมูลโปรไฟล์ (ชื่อที่แสดง, ชื่อผู้ใช้) และ/หรือเปลี่ยนรหัสผ่าน
 */
export async function PATCH(request: Request) {
  const session = getAuthenticatedUser(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'ไม่มีสิทธิ์เข้าถึง หรือเซสชันหมดอายุ' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { displayName, username, currentPassword, newPassword } = body;

    const { user, token } = await updateUserProfile({
      userId: session.userId,
      displayName,
      username,
      currentPassword,
      newPassword
    });

    const response = NextResponse.json({
      success: true,
      message: newPassword ? 'เปลี่ยนรหัสผ่านและอัปเดตโปรไฟล์เรียบร้อยแล้ว' : 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      token
    });

    // Update session cookie with new token
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('admin_session', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: SESSION_MAX_AGE_SECONDS
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'อัปเดตข้อมูลโปรไฟล์ไม่สำเร็จ' },
      { status: 400 }
    );
  }
}
