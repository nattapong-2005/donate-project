import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/auth';
import { createUser } from '@/lib/services/userService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Only authenticated admin can create new accounts
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { success: false, message: 'ไม่มีสิทธิ์ในการสร้างบัญชีผู้ใช้ กรุณาเข้าสู่ระบบก่อน' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { username, password, displayName, role } = body;

    const newUser = await createUser({
      username,
      password,
      displayName,
      role: role || 'admin'
    });

    return NextResponse.json({
      success: true,
      message: 'สร้างบัญชีผู้ใช้งานใหม่เรียบร้อยแล้ว',
      user: newUser
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'ไม่สามารถสร้างผู้ใช้งานได้' },
      { status: 400 }
    );
  }
}
