import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyAdminAuth } from '@/lib/auth';
import { calculateTimerDelta, computeRemainingSeconds, readTimerConfig } from '@/lib/timerLogic';
import { TimerEventPayload } from '@/lib/timerTypes';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { deltaSeconds, simulate, amount, name } = body;

    // 1. Fetch current timer settings
    const { data: rows, error: fetchErr } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .ilike('key', 'timer_%');

    if (fetchErr) throw fetchErr;

    const settings: Record<string, string> = {};
    if (rows) {
      rows.forEach(r => {
        settings[r.key] = r.value;
      });
    }

    const config = readTimerConfig(settings);
    let currentRemaining = computeRemainingSeconds(config);
    let effectiveDelta = 0;
    let donorName = name || 'ผู้ชมทดสอบ';
    let donorAmount = 0;
    let ruleMatched = '';

    if (simulate && Number.isFinite(Number(amount)) && Number(amount) > 0) {
      donorAmount = Number(amount);
      const calc = calculateTimerDelta(donorAmount, config);
      effectiveDelta = calc.deltaSeconds;
      ruleMatched = calc.ruleMatched;
    } else if (Number.isFinite(Number(deltaSeconds))) {
      effectiveDelta = Math.round(Number(deltaSeconds));
      donorName = 'สตรีมเมอร์';
      ruleMatched = `ปรับเวลาเอง ${effectiveDelta > 0 ? '+' : ''}${effectiveDelta}s`;
    }

    if (effectiveDelta === 0 && !simulate) {
      return NextResponse.json({
        success: false,
        message: 'กรุณาระบุเวลาที่ต้องการปรับเปลี่ยน'
      }, { status: 400 });
    }

    // Apply delta
    let newRemaining = Math.max(0, currentRemaining + effectiveDelta);
    if (config.timer_max_cap_seconds > 0 && newRemaining > config.timer_max_cap_seconds) {
      newRemaining = config.timer_max_cap_seconds;
    }

    const nowIso = new Date().toISOString();
    config.timer_remaining_seconds = newRemaining;
    config.timer_last_updated_at = nowIso;

    // Save updated time to database
    const upsertRows = [
      { key: 'timer_remaining_seconds', value: String(newRemaining) },
      { key: 'timer_last_updated_at', value: nowIso }
    ];

    const { error: upsertErr } = await supabaseAdmin
      .from('settings')
      .upsert(upsertRows, { onConflict: 'key' });

    if (upsertErr) throw upsertErr;

    // Broadcast event to Supabase Realtime channel for OBS overlay
    const eventPayload: TimerEventPayload = {
      remaining_seconds: newRemaining,
      status: config.timer_status,
      last_updated_at: nowIso,
      delta_seconds: effectiveDelta,
      donor_name: donorName,
      donor_amount: donorAmount > 0 ? donorAmount : undefined,
      reason: ruleMatched || 'manual_adjustment'
    };

    const channel = supabaseAdmin.channel('donation-alerts');
    try {
      await channel.httpSend('timer_update', eventPayload);
    } catch (realtimeErr: any) {
      console.warn('Realtime timer broadcast warning:', realtimeErr.message);
    } finally {
      await supabaseAdmin.removeChannel(channel).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: simulate
        ? `จำลองโดเนท ฿${donorAmount} สำเร็จ (${effectiveDelta >= 0 ? '+' : ''}${effectiveDelta}s)`
        : `ปรับเวลา ${effectiveDelta >= 0 ? '+' : ''}${effectiveDelta} วินาที เรียบร้อยแล้ว`,
      deltaSeconds: effectiveDelta,
      remaining_seconds: newRemaining,
      ruleMatched
    });
  } catch (error: any) {
    console.error('Timer adjust API error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'ปรับเวลาไม่สำเร็จ' },
      { status: 500 }
    );
  }
}
