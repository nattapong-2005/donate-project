import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyAdminAuth } from '@/lib/auth';
import { GoalAppearance, goalAppearanceDefaults, validGoalAppearance } from '@/lib/goalAppearance';
import { SupporterAppearance, supporterDefaults, validSupporterAppearance } from '@/lib/supporterAppearance';

export const dynamic = 'force-dynamic';

function publicSettings(settings: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(settings).filter(([key]) =>
    key.startsWith('alert_') ||
    ['receiver_name', 'min_donate', 'tts_enabled', 'tts_min_amount'].includes(key)
  ));
}

export async function GET(request: Request) {
  try {
    const isAdmin = verifyAdminAuth(request);

    const { data: rows, error } = await supabaseAdmin
      .from('settings')
      .select('key, value');

    if (error) throw error;

    const settings: Record<string, string> = {};
    if (rows) {
      rows.forEach((r: any) => {
        // Mask secret keys for non-admin requests
        if (!isAdmin && (r.key === 'slipok_api_key' || r.key === 'admin_secret')) {
          settings[r.key] = r.value ? '********' : '';
        } else {
          settings[r.key] = r.value;
        }
      });
    }

    return NextResponse.json({
      success: true,
      settings: isAdmin ? settings : publicSettings(settings)
    });
  } catch (err: any) {
    console.error('Get settings error:', err);
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
    const newSettings = await request.json();
    if (!newSettings || typeof newSettings !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    if (('goal_target' in newSettings && (!Number.isFinite(Number(newSettings.goal_target)) || Number(newSettings.goal_target) <= 0 || Number(newSettings.goal_target) > 9999999999)) ||
        ('goal_title' in newSettings && (typeof newSettings.goal_title !== 'string' || !newSettings.goal_title.trim() || newSettings.goal_title.length > 160)) ||
        ('goal_started_at' in newSettings && newSettings.goal_started_at !== '' && !Number.isFinite(Date.parse(newSettings.goal_started_at)))) {
      return NextResponse.json({ success: false, message: 'ชื่อเป้าหมาย ยอดเงิน หรือวันเริ่มต้นไม่ถูกต้อง' }, { status: 400 });
    }

    // Upsert into Supabase settings table
    for (const key of Object.keys(goalAppearanceDefaults) as (keyof GoalAppearance)[]) {
      if (key in newSettings && !validGoalAppearance(key, newSettings[key])) {
        return NextResponse.json({ success: false, message: `ค่ารูปแบบเป้าหมายไม่ถูกต้อง: ${key}` }, { status: 400 });
      }
    }
    for (const key of Object.keys(supporterDefaults) as (keyof SupporterAppearance)[]) {
      if (key in newSettings && !validSupporterAppearance(key, newSettings[key])) {
        return NextResponse.json({ success: false, message: `ค่ารูปแบบอันดับไม่ถูกต้อง: ${key}` }, { status: 400 });
      }
    }
    const upsertRows = Object.entries(newSettings).map(([key, value]) => ({
      key,
      value: String(value ?? '')
    }));

    const { error } = await supabaseAdmin
      .from('settings')
      .upsert(upsertRows, { onConflict: 'key' });

    if (error) throw error;

    // Fetch updated complete settings to broadcast
    const { data: allRows } = await supabaseAdmin
      .from('settings')
      .select('key, value');

    const updatedSettings: Record<string, string> = {};
    if (allRows) {
      allRows.forEach((r: any) => {
        updatedSettings[r.key] = r.value;
      });
    }

    // Broadcast live to OBS overlay
    const channel = supabaseAdmin.channel('donation-alerts');
    try {
      await channel.httpSend('settings_updated', publicSettings(updatedSettings));
    } catch (realtimeErr: any) {
      console.warn('Realtime broadcast error:', realtimeErr.message);
    } finally {
      await supabaseAdmin.removeChannel(channel).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่าและอัปเดตไปยัง OBS เรียบร้อยแล้ว',
      settings: updatedSettings
    });
  } catch (err: any) {
    console.error('Update settings error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
