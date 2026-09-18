import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyAdminAuth } from '@/lib/auth';
import { computeRemainingSeconds, readTimerConfig } from '@/lib/timerLogic';
import { TimerConfig, TimerEventPayload } from '@/lib/timerTypes';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

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

    return NextResponse.json({
      success: true,
      config,
      liveRemaining
    });
  } catch (error: any) {
    console.error('Admin timer GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'โหลดข้อมูลไม่สำเร็จ' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { command, config: updatedConfig, reason } = body;

    // Fetch current timer settings
    const { data: currentRows, error: fetchErr } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .ilike('key', 'timer_%');

    if (fetchErr) throw fetchErr;

    const currentSettings: Record<string, string> = {};
    if (currentRows) {
      currentRows.forEach(r => {
        currentSettings[r.key] = r.value;
      });
    }

    let config = readTimerConfig(currentSettings);
    let liveRemaining = computeRemainingSeconds(config);
    const nowIso = new Date().toISOString();
    let deltaSec: number | undefined = undefined;

    // Handle State Commands
    if (command === 'start' || command === 'resume') {
      if (liveRemaining <= 0) {
        liveRemaining = config.timer_initial_seconds > 0 ? config.timer_initial_seconds : 3600;
      }
      config.timer_status = 'running';
      config.timer_remaining_seconds = liveRemaining;
      config.timer_last_updated_at = nowIso;
    } else if (command === 'pause') {
      config.timer_status = 'paused';
      config.timer_remaining_seconds = liveRemaining;
      config.timer_last_updated_at = nowIso;
    } else if (command === 'stop') {
      config.timer_status = 'stopped';
      config.timer_remaining_seconds = 0;
      config.timer_last_updated_at = nowIso;
    } else if (command === 'reset') {
      config.timer_status = 'paused';
      config.timer_remaining_seconds = config.timer_initial_seconds;
      config.timer_last_updated_at = nowIso;
    } else if (command === 'set_time') {
      const newSec = Number(body.seconds);
      if (Number.isFinite(newSec) && newSec >= 0) {
        deltaSec = newSec - liveRemaining;
        config.timer_remaining_seconds = newSec;
        config.timer_last_updated_at = nowIso;
        liveRemaining = newSec;
      }
    }

    // Handle Config / Settings updates
    if (updatedConfig && typeof updatedConfig === 'object') {
      if (updatedConfig.timer_enabled !== undefined) {
        config.timer_enabled = Boolean(updatedConfig.timer_enabled);
      }
      if (Number.isFinite(Number(updatedConfig.timer_initial_seconds))) {
        config.timer_initial_seconds = Math.max(0, Number(updatedConfig.timer_initial_seconds));
      }
      if (Number.isFinite(Number(updatedConfig.timer_max_cap_seconds))) {
        config.timer_max_cap_seconds = Math.max(0, Number(updatedConfig.timer_max_cap_seconds));
      }
      if (updatedConfig.timer_base_rate_enabled !== undefined) {
        config.timer_base_rate_enabled = Boolean(updatedConfig.timer_base_rate_enabled);
      }
      if (Number.isFinite(Number(updatedConfig.timer_base_rate_amount))) {
        config.timer_base_rate_amount = Math.max(0.01, Number(updatedConfig.timer_base_rate_amount));
      }
      if (Number.isFinite(Number(updatedConfig.timer_base_rate_seconds))) {
        config.timer_base_rate_seconds = Math.max(1, Number(updatedConfig.timer_base_rate_seconds));
      }
      if (updatedConfig.timer_base_rate_action === 'subtract' || updatedConfig.timer_base_rate_action === 'add') {
        config.timer_base_rate_action = updatedConfig.timer_base_rate_action;
      }
      if (Array.isArray(updatedConfig.timer_tier_rules)) {
        config.timer_tier_rules = updatedConfig.timer_tier_rules;
      }
      if (updatedConfig.timer_appearance && typeof updatedConfig.timer_appearance === 'object') {
        config.timer_appearance = {
          ...config.timer_appearance,
          ...updatedConfig.timer_appearance
        };
      }
    }

    // Ensure clamped to max cap
    if (config.timer_max_cap_seconds > 0 && config.timer_remaining_seconds > config.timer_max_cap_seconds) {
      config.timer_remaining_seconds = config.timer_max_cap_seconds;
      liveRemaining = config.timer_max_cap_seconds;
    }

    // Save to settings table
    const upsertRows = [
      { key: 'timer_enabled', value: String(config.timer_enabled) },
      { key: 'timer_status', value: config.timer_status },
      { key: 'timer_initial_seconds', value: String(config.timer_initial_seconds) },
      { key: 'timer_remaining_seconds', value: String(config.timer_remaining_seconds) },
      { key: 'timer_last_updated_at', value: config.timer_last_updated_at },
      { key: 'timer_max_cap_seconds', value: String(config.timer_max_cap_seconds) },
      { key: 'timer_base_rate_enabled', value: String(config.timer_base_rate_enabled) },
      { key: 'timer_base_rate_amount', value: String(config.timer_base_rate_amount) },
      { key: 'timer_base_rate_seconds', value: String(config.timer_base_rate_seconds) },
      { key: 'timer_base_rate_action', value: config.timer_base_rate_action },
      { key: 'timer_tier_rules', value: JSON.stringify(config.timer_tier_rules) },
      { key: 'timer_appearance', value: JSON.stringify(config.timer_appearance) }
    ];

    const { error: upsertErr } = await supabaseAdmin
      .from('settings')
      .upsert(upsertRows, { onConflict: 'key' });

    if (upsertErr) throw upsertErr;

    // Broadcast update to Supabase Realtime channel
    const eventPayload: TimerEventPayload = {
      remaining_seconds: config.timer_remaining_seconds,
      status: config.timer_status,
      last_updated_at: config.timer_last_updated_at,
      delta_seconds: deltaSec,
      reason: reason || command || 'settings_updated'
    };

    const channel = supabaseAdmin.channel('donation-alerts');
    try {
      await channel.httpSend('timer_update', {
        ...eventPayload,
        appearance: config.timer_appearance
      });
    } catch (realtimeErr: any) {
      console.warn('Realtime timer broadcast warning:', realtimeErr.message);
    } finally {
      await supabaseAdmin.removeChannel(channel).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่าตัวจับเวลาเรียบร้อยแล้ว',
      config,
      liveRemaining: config.timer_remaining_seconds
    });
  } catch (error: any) {
    console.error('Admin timer POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'บันทึกข้อมูลไม่สำเร็จ' },
      { status: 500 }
    );
  }
}
