import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { filterMessage } from '@/lib/services/blacklist';
import { verifyAdminAuth } from '@/lib/auth';
import { Donation } from '@/lib/types/database';

export async function POST(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, amount, message } = body;

    const filteredMsg = await filterMessage(message || 'นี่คือการทดสอบระบบ Alert ขึ้นจอ OBS ผ่าน Supabase Realtime!');
    const testData: Donation = {
      id: 'test-' + Date.now(),
      name: (name || 'ผู้ชมทดสอบ').slice(0, 50),
      amount: parseFloat(amount) || 50,
      message: filteredMsg.slice(0, 200),
      sender_bank: 'TEST',
      created_at: new Date().toLocaleTimeString('th-TH'),
      isTest: true
    };

    // Broadcast through Supabase Realtime channel
    const channel = supabaseAdmin.channel('donation-alerts');
    try {
      await channel.httpSend('donation', testData);
    } finally {
      await supabaseAdmin.removeChannel(channel).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'ส่ง Test Alert ขึ้นหน้าจอ OBS เรียบร้อยแล้ว!',
      data: testData
    });
  } catch (err: any) {
    console.error('Test alert error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
