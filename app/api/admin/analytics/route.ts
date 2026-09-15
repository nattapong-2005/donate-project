import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const THAI_MONTH_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTH_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

interface DonationRow {
  id: number | string;
  name: string;
  amount: number | string;
  message?: string;
  created_at: string;
  status?: string;
}

function getBangkokInfo(dateInput: string | Date) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return {
      dateStr: '1970-01-01',
      monthStr: '1970-01',
      year: 1970,
      month: 1,
      day: 1,
      hour: 0,
      thaiDateLabel: '1 ม.ค.',
      thaiMonthLabel: 'ม.ค. 1970',
      thaiMonthFullLabel: 'มกราคม 1970'
    };
  }

  // Format YYYY-MM-DD
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  const day = parseInt(dayStr, 10);

  // Hour in Bangkok (0-23)
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    hour: 'numeric',
    hourCycle: 'h23'
  }).format(d);
  const hour = parseInt(hourStr, 10) || 0;

  const monthKey = `${yearStr}-${monthStr}`;
  const thaiDateLabel = `${day} ${THAI_MONTH_SHORT[month - 1]}`;
  const thaiMonthLabel = `${THAI_MONTH_SHORT[month - 1]} ${year + 543}`;
  const thaiMonthFullLabel = `${THAI_MONTH_FULL[month - 1]} ${year + 543}`;

  return {
    dateStr,
    monthStr: monthKey,
    year,
    month,
    day,
    hour,
    thaiDateLabel,
    thaiMonthLabel,
    thaiMonthFullLabel
  };
}

export async function GET(request: Request) {
  // Verify Admin Auth
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const selectedMonth = searchParams.get('month'); // optional e.g. "2026-09"

    // Fetch all verified donations
    const { data: rawDonations, error } = await supabaseAdmin
      .from('donations')
      .select('id, name, amount, message, created_at, status')
      .eq('status', 'verified')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const donations: DonationRow[] = rawDonations || [];
    const now = new Date();
    const currentBkk = getBangkokInfo(now);
    const activeMonthKey = selectedMonth || currentBkk.monthStr;

    // 1. Basic Overall Metrics
    let totalRevenue = 0;
    let totalCount = donations.length;
    let thisMonthRevenue = 0;
    let thisMonthCount = 0;
    let lastMonthRevenue = 0;
    let lastMonthCount = 0;
    const uniqueDonorsSet = new Set<string>();

    // Determine previous month string
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const prevMonthKey = getBangkokInfo(lastMonthDate).monthStr;

    // Available months list map
    const availableMonthsMap = new Map<string, { key: string; label: string; count: number; total: number }>();

    // 2. 24-Hour Distribution (Peak Hours)
    const hourlyData: { hour: number; label: string; amount: number; count: number; percentage: number }[] = Array.from(
      { length: 24 },
      (_, h) => ({
        hour: h,
        label: `${String(h).padStart(2, '0')}:00`,
        amount: 0,
        count: 0,
        percentage: 0
      })
    );

    // 3. Daily map (for last 30 days)
    const dailyMap = new Map<string, { date: string; label: string; amount: number; count: number }>();
    // Pre-populate last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const bkk = getBangkokInfo(d);
      dailyMap.set(bkk.dateStr, {
        date: bkk.dateStr,
        label: bkk.thaiDateLabel,
        amount: 0,
        count: 0
      });
    }

    // 4. Monthly map (for last 12 months)
    const monthlyMap = new Map<string, { month: string; label: string; amount: number; count: number }>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const bkk = getBangkokInfo(d);
      monthlyMap.set(bkk.monthStr, {
        month: bkk.monthStr,
        label: bkk.thaiMonthLabel,
        amount: 0,
        count: 0
      });
    }

    // 5. Top Donators for Selected Month & All-Time
    const selectedMonthDonors = new Map<
      string,
      { name: string; totalAmount: number; count: number; topSingle: number; lastDonatedAt: string }
    >();

    const allTimeDonors = new Map<
      string,
      { name: string; totalAmount: number; count: number; topSingle: number; lastDonatedAt: string }
    >();

    // Process all donations
    donations.forEach((d) => {
      const amt = parseFloat(String(d.amount)) || 0;
      const bkk = getBangkokInfo(d.created_at || now.toISOString());
      const rawName = (d.name || 'Anonymous').trim();
      const donorKey = rawName.toLowerCase();

      totalRevenue += amt;
      if (rawName) uniqueDonorsSet.add(donorKey);

      // Track available months
      if (!availableMonthsMap.has(bkk.monthStr)) {
        availableMonthsMap.set(bkk.monthStr, {
          key: bkk.monthStr,
          label: bkk.thaiMonthFullLabel,
          count: 0,
          total: 0
        });
      }
      const mEntry = availableMonthsMap.get(bkk.monthStr)!;
      mEntry.count += 1;
      mEntry.total += amt;

      // This month & Last month totals
      if (bkk.monthStr === currentBkk.monthStr) {
        thisMonthRevenue += amt;
        thisMonthCount += 1;
      } else if (bkk.monthStr === prevMonthKey) {
        lastMonthRevenue += amt;
        lastMonthCount += 1;
      }

      // Hourly aggregation
      if (bkk.hour >= 0 && bkk.hour < 24) {
        hourlyData[bkk.hour].amount += amt;
        hourlyData[bkk.hour].count += 1;
      }

      // Daily aggregation
      if (dailyMap.has(bkk.dateStr)) {
        const item = dailyMap.get(bkk.dateStr)!;
        item.amount += amt;
        item.count += 1;
      }

      // Monthly aggregation
      if (monthlyMap.has(bkk.monthStr)) {
        const item = monthlyMap.get(bkk.monthStr)!;
        item.amount += amt;
        item.count += 1;
      }

      // Top donators for selected month
      if (bkk.monthStr === activeMonthKey) {
        if (!selectedMonthDonors.has(donorKey)) {
          selectedMonthDonors.set(donorKey, {
            name: rawName,
            totalAmount: amt,
            count: 1,
            topSingle: amt,
            lastDonatedAt: d.created_at
          });
        } else {
          const s = selectedMonthDonors.get(donorKey)!;
          s.totalAmount += amt;
          s.count += 1;
          if (amt > s.topSingle) s.topSingle = amt;
          if (new Date(d.created_at) > new Date(s.lastDonatedAt)) {
            s.lastDonatedAt = d.created_at;
          }
        }
      }

      // All-time top donators
      if (!allTimeDonors.has(donorKey)) {
        allTimeDonors.set(donorKey, {
          name: rawName,
          totalAmount: amt,
          count: 1,
          topSingle: amt,
          lastDonatedAt: d.created_at
        });
      } else {
        const s = allTimeDonors.get(donorKey)!;
        s.totalAmount += amt;
        s.count += 1;
        if (amt > s.topSingle) s.topSingle = amt;
        if (new Date(d.created_at) > new Date(s.lastDonatedAt)) {
          s.lastDonatedAt = d.created_at;
        }
      }
    });

    // Compute Hourly percentages and identify Peak Hours
    let maxHourAmount = 0;
    let peakHourIndex = 0;
    hourlyData.forEach((h, idx) => {
      h.percentage = totalRevenue > 0 ? Number(((h.amount / totalRevenue) * 100).toFixed(1)) : 0;
      if (h.amount > maxHourAmount) {
        maxHourAmount = h.amount;
        peakHourIndex = idx;
      }
    });

    // Top 3 peak hours
    const sortedHours = [...hourlyData].sort((a, b) => b.amount - a.amount || b.count - a.count);
    const topPeakHours = sortedHours.slice(0, 3).filter((h) => h.amount > 0 || h.count > 0);

    const peakHourWindow =
      topPeakHours.length > 0
        ? `${String(peakHourIndex).padStart(2, '0')}:00 - ${String((peakHourIndex + 2) % 24).padStart(2, '0')}:00 น.`
        : '19:00 - 22:00 น. (ช่วงแนะนำ)';

    // 6. Weekly Aggregation (last 12 weeks)
    const weeklyList: {
      week: string;
      label: string;
      startDate: string;
      endDate: string;
      amount: number;
      count: number;
    }[] = [];

    // Calculate last 12 weeks boundaries
    for (let w = 11; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);

      const startBkk = getBangkokInfo(start);
      const endBkk = getBangkokInfo(end);

      const startStr = startBkk.dateStr;
      const endStr = endBkk.dateStr;

      let weekAmount = 0;
      let weekCount = 0;

      donations.forEach((d) => {
        const dDateStr = getBangkokInfo(d.created_at).dateStr;
        if (dDateStr >= startStr && dDateStr <= endStr) {
          weekAmount += parseFloat(String(d.amount)) || 0;
          weekCount += 1;
        }
      });

      weeklyList.push({
        week: `W${12 - w}`,
        label: `${startBkk.thaiDateLabel} - ${endBkk.thaiDateLabel}`,
        startDate: startStr,
        endDate: endStr,
        amount: weekAmount,
        count: weekCount
      });
    }

    // Sort Top Donators
    const topDonatorsSelectedMonth = Array.from(selectedMonthDonors.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 20)
      .map((d, index) => ({
        rank: index + 1,
        ...d
      }));

    const topDonatorsAllTime = Array.from(allTimeDonors.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10)
      .map((d, index) => ({
        rank: index + 1,
        ...d
      }));

    // Growth percentage calculation
    const growthPercent =
      lastMonthRevenue > 0
        ? Number((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
        : thisMonthRevenue > 0
        ? 100
        : 0;

    const avgDonation = totalCount > 0 ? Number((totalRevenue / totalCount).toFixed(2)) : 0;

    // Ensure available months list includes current month
    if (!availableMonthsMap.has(currentBkk.monthStr)) {
      availableMonthsMap.set(currentBkk.monthStr, {
        key: currentBkk.monthStr,
        label: currentBkk.thaiMonthFullLabel,
        count: 0,
        total: 0
      });
    }

    const availableMonths = Array.from(availableMonthsMap.values()).sort((a, b) => b.key.localeCompare(a.key));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalCount,
          thisMonthRevenue,
          thisMonthCount,
          lastMonthRevenue,
          lastMonthCount,
          growthPercent,
          avgDonation,
          uniqueDonors: uniqueDonorsSet.size,
          peakHourWindow,
          peakHour: peakHourIndex,
          peakHourAmount: maxHourAmount
        },
        charts: {
          daily: Array.from(dailyMap.values()),
          weekly: weeklyList,
          monthly: Array.from(monthlyMap.values()),
          peakHours: {
            hourly: hourlyData,
            topHours: topPeakHours,
            peakWindow: peakHourWindow
          }
        },
        topDonators: {
          selectedMonth: activeMonthKey,
          selectedMonthLabel:
            availableMonthsMap.get(activeMonthKey)?.label || currentBkk.thaiMonthFullLabel,
          list: topDonatorsSelectedMonth,
          allTime: topDonatorsAllTime,
          availableMonths
        }
      }
    });
  } catch (err: any) {
    console.error('Analytics API error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error generating analytics' },
      { status: 500 }
    );
  }
}
