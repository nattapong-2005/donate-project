'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { StatCard } from '@/app/components';
import { useAdmin } from '../AdminContext';
import {
  RevenueTrendChart,
  PeakHoursChart,
  TopDonatorsLeaderboard,
  DailyDataPoint,
  WeeklyDataPoint,
  MonthlyDataPoint,
  HourlyDataPoint,
  TopDonator
} from './AnalyticsCharts';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalCount: number;
    thisMonthRevenue: number;
    thisMonthCount: number;
    lastMonthRevenue: number;
    lastMonthCount: number;
    growthPercent: number;
    avgDonation: number;
    uniqueDonors: number;
    peakHourWindow: string;
    peakHour: number;
    peakHourAmount: number;
  };
  charts: {
    daily: DailyDataPoint[];
    weekly: WeeklyDataPoint[];
    monthly: MonthlyDataPoint[];
    peakHours: {
      hourly: HourlyDataPoint[];
      topHours: HourlyDataPoint[];
      peakWindow: string;
    };
  };
  topDonators: {
    selectedMonth: string;
    selectedMonthLabel: string;
    list: TopDonator[];
    allTime: TopDonator[];
    availableMonths: { key: string; label: string; count: number; total: number }[];
  };
}

function AnalyticsPageContent() {
  const { showToast, handleUnauthorized } = useAdmin();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAnalytics = useCallback(async (monthToFetch?: string) => {
    try {
      setIsRefreshing(true);
      const url = monthToFetch
        ? `/api/admin/analytics?month=${encodeURIComponent(monthToFetch)}`
        : '/api/admin/analytics';

      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (!selectedMonth && json.data.topDonators?.selectedMonth) {
          setSelectedMonth(json.data.topDonators.selectedMonth);
        }
      } else {
        showToast(json.message || 'ไม่สามารถโหลดข้อมูลสถิติได้');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [handleUnauthorized, showToast, selectedMonth]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    fetchAnalytics(newMonth);
  };

  // Export Daily Statistics to CSV
  const handleExportCSV = () => {
    if (!data) return;

    try {
      const headers = ['วันที่ (Date)', 'ยอดบริจาค (Amount)', 'จำนวนครั้ง (Count)'];
      const rows = data.charts.daily.map((d) => [d.date, d.amount, d.count]);

      const csvContent =
        '\uFEFF' + // UTF-8 BOM for Excel Thai language support
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `donation_stats_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('ดาวน์โหลดรายงาน CSV เรียบร้อยแล้ว!');
    } catch (e: any) {
      alert('ส่งออกรายงานไม่สำเร็จ: ' + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="analytics-loading-state">
        <div className="spinner-glow"></div>
        <p>กำลังประมวลผลสถิติและข้อมูลเชิงลึก...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          ไม่สามารถดึงข้อมูลสถิติได้ในขณะนี้
        </p>
        <button type="button" className="btn primary" onClick={() => fetchAnalytics()}>
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const { summary, charts, topDonators } = data;

  return (
    <div className="analytics-page-container">
      {/* Top Header & Actions Bar */}
      <div className="analytics-top-header">
        <div>
          <div className="analytics-breadcrumb">
            <Link href="/admin">แดชบอร์ด</Link>
            <span className="sep">/</span>
            <span className="current">สถิติเชิงลึก & ชาร์ต</span>
          </div>
          <h1 className="analytics-page-title">แดชบอร์ดสรุปสถิติเชิงลึก (Advanced Analytics)</h1>
          <p className="analytics-page-desc">
            กราฟวิเคราะห์รายได้, ช่วงเวลาที่มีผู้สนับสนุนมากที่สุด (Peak Hours) และกระดานผู้นำ Top Donator
          </p>
        </div>

        <div className="analytics-header-actions">
          <button
            type="button"
            className="btn secondary sm"
            onClick={handleExportCSV}
            title="ดาวน์โหลดข้อมูลเป็นไฟล์ Excel / CSV"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            ส่งออก CSV
          </button>

          <button
            type="button"
            className={`btn sm ${isRefreshing ? 'disabled' : ''}`}
            onClick={() => fetchAnalytics(selectedMonth)}
            disabled={isRefreshing}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isRefreshing ? 'spin-anim' : ''}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            {isRefreshing ? 'กำลังอัปเดต...' : 'รีเฟรช'}
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="stats-grid">
        <StatCard
          iconVariant="green"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          }
          title="รายได้เดือนนี้"
          value={`฿${summary.thisMonthRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className={`badge-growth ${summary.growthPercent >= 0 ? 'up' : 'down'}`}>
                {summary.growthPercent >= 0 ? `▲ +${summary.growthPercent}%` : `▼ ${summary.growthPercent}%`}
              </span>
              <span>เทียบเดือนก่อน ({summary.thisMonthCount} รายการ)</span>
            </span>
          }
        />

        <StatCard
          iconVariant="blue"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          }
          title="ยอดเฉลี่ย / การโดเนท"
          value={`฿${summary.avgDonation.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`จากทั้งหมด ${summary.totalCount.toLocaleString()} รายการ`}
        />

        <StatCard
          iconVariant="orange"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
          title="ช่วงเวลาทอง (Peak Window)"
          value={<span style={{ fontSize: '18px' }}>{summary.peakHourWindow}</span>}
          subtitle={
            summary.peakHourAmount > 0
              ? `ยอดสะสมสูงสุด ฿${summary.peakHourAmount.toLocaleString()}`
              : 'เวลาที่มีการโดเนทหนาแน่น'
          }
        />

        <StatCard
          iconVariant="purple"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          }
          title="ผู้สนับสนุนสะสม"
          value={`${summary.uniqueDonors.toLocaleString()} คน`}
          subtitle={`ยอดสะสมรวม ฿${summary.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
        />
      </div>

      {/* 1. Revenue Trends Interactive Chart */}
      <RevenueTrendChart
        daily={charts.daily}
        weekly={charts.weekly}
        monthly={charts.monthly}
      />

      {/* 2. Peak Hours 24-Hour Analysis */}
      <PeakHoursChart
        hourly={charts.peakHours.hourly}
        topHours={charts.peakHours.topHours}
        peakWindow={charts.peakHours.peakWindow}
      />

      {/* 3. Top Donators Leaderboard */}
      <TopDonatorsLeaderboard
        donators={topDonators.list}
        allTimeDonators={topDonators.allTime}
        availableMonths={topDonators.availableMonths}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
          กำลังโหลดสถิติเชิงลึก...
        </div>
      }
    >
      <AnalyticsPageContent />
    </Suspense>
  );
}
