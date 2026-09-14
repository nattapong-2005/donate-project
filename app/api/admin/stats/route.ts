import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { checkQuota } from '@/lib/services/slipok';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Verify Admin Auth
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: totalDonations, error: totalErr } = await supabaseAdmin
      .from('donations')
      .select('amount, created_at')
      .eq('status', 'verified');

    if (totalErr) throw totalErr;

    const count = totalDonations ? totalDonations.length : 0;
    const totalAmount = totalDonations
      ? totalDonations.reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0)
      : 0;

    // Today stats (using Bangkok timezone GMT+7)
    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(now);

    const todayDonations = (totalDonations || []).filter((d: any) => {
      if (!d.created_at) return false;
      const dDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date(d.created_at));
      return dDateStr === todayStr;
    });

    const todayCount = todayDonations.length;
    const todayAmount = todayDonations.reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0);

    let quotaInfo = null;
    try {
      const q = await checkQuota();
      if (q && q.data) {
        quotaInfo = q.data;
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      stats: {
        count,
        totalAmount,
        todayCount,
        todayAmount
      },
      quota: quotaInfo
    });
  } catch (err: any) {
    console.error('Stats error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error fetching stats' },
      { status: 500 }
    );
  }
}
