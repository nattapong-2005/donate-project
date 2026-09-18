import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { computeRemainingSeconds, readTimerConfig } from '@/lib/timerLogic';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: rows, error } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .ilike('key', 'timer_%');

    if (error) throw error;

    const settings: Record<string, string> = {};
    if (rows) {
      rows.forEach(r => {
        settings[r.key] = r.value;
      });
    }

    const config = readTimerConfig(settings);
    const liveRemaining = computeRemainingSeconds(config);

    return NextResponse.json(
      {
        success: true,
        data: {
          enabled: config.timer_enabled,
          status: config.timer_status,
          remaining_seconds: liveRemaining,
          initial_seconds: config.timer_initial_seconds,
          max_cap_seconds: config.timer_max_cap_seconds,
          last_updated_at: config.timer_last_updated_at,
          appearance: config.timer_appearance
        }
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Timer public API error:', error);
    return NextResponse.json(
      { success: false, message: 'โหลดข้อมูลตัวจับเวลาไม่สำเร็จ: ' + error.message },
      { status: 500 }
    );
  }
}
