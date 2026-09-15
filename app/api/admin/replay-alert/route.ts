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
    const { id, name, amount, message } = body;

    const filteredMsg = await filterMessage(message || '');
    const replayData: Donation = {
      id: id || 'replay-' + Date.now(),
      name: (name || 'ผู้สนับสนุน').slice(0, 50),
      amount: parseFloat(amount) || 50,
      message: filteredMsg.slice(0, 200),
      created_at: new Date().toLocaleTimeString('th-TH'),
      isReplay: true
    };

    const channel = supabaseAdmin.channel('donation-alerts', { config: { private: true } });
    try {
      await channel.httpSend('donation', replayData);
    } finally {
      await supabaseAdmin.removeChannel(channel).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'ส่ง Replay Alert ขึ้นจอแล้ว!',
      data: replayData
    });
  } catch (err: any) {
    console.error('Replay alert error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
