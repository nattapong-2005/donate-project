import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { summarizeWidgets } from '@/lib/widgets';
import { goalAppearanceDefaults } from '@/lib/goalAppearance';
import { supporterDefaults } from '@/lib/supporterAppearance';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: settingsRows, error } = await supabaseAdmin.from('settings').select('key, value').in('key', ['goal_title', 'goal_target', 'goal_started_at', ...Object.keys(goalAppearanceDefaults), ...Object.keys(supporterDefaults)]);
    if (error) throw error;
    const settings = Object.fromEntries((settingsRows || []).map(row => [row.key, row.value]));
    const rows: { name: string; amount: number; created_at: string }[] = [];
    // Paginate so totals remain accurate beyond Supabase's default row limit.
    for (let offset = 0; ; offset += 1000) {
      const { data, error: donationError } = await supabaseAdmin.from('donations').select('name, amount, created_at').eq('status', 'verified').order('created_at', { ascending: false }).order('id', { ascending: false }).range(offset, offset + 999);
      if (donationError) throw donationError;
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    return NextResponse.json({ success: true, data: summarizeWidgets(rows, settings) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Widget data error:', error);
    return NextResponse.json({ success: false, message: 'โหลดข้อมูลวิดเจ็ตไม่สำเร็จ' }, { status: 500 });
  }
}
