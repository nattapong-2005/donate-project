import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: words, error } = await supabaseAdmin
      .from('blacklist')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      blacklist: words || []
    });
  } catch (err: any) {
    console.error('Get blacklist error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { word } = await request.json();
    if (!word || !word.trim()) {
      return NextResponse.json({ success: false, message: 'กรุณากรอกคำที่ต้องการแบน' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('blacklist')
      .insert([{ word: word.trim().toLowerCase() }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, message: 'คำนี้มีอยู่ในระบบแล้ว' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (err: any) {
    console.error('Add blacklist error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('blacklist')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'ลบคำออกจากแบล็กลิสต์แล้ว'
    });
  } catch (err: any) {
    console.error('Delete blacklist error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
