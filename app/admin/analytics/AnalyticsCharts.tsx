'use client';

import React, { useState, useMemo } from 'react';

// Data interfaces
export interface DailyDataPoint {
  date: string;
  label: string;
  amount: number;
  count: number;
}

export interface WeeklyDataPoint {
  week: string;
  label: string;
  startDate: string;
  endDate: string;
  amount: number;
  count: number;
}

export interface MonthlyDataPoint {
  month: string;
  label: string;
  amount: number;
  count: number;
}

export interface HourlyDataPoint {
  hour: number;
  label: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface TopDonator {
  rank: number;
  name: string;
  totalAmount: number;
  count: number;
  topSingle: number;
  lastDonatedAt: string;
}

// -------------------------------------------------------------
// 1. REVENUE TREND CHART (Daily / Weekly / Monthly)
// -------------------------------------------------------------
interface RevenueTrendChartProps {
  daily: DailyDataPoint[];
  weekly: WeeklyDataPoint[];
  monthly: MonthlyDataPoint[];
}

export function RevenueTrendChart({ daily, weekly, monthly }: RevenueTrendChartProps) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeData = useMemo(() => {
    if (timeframe === 'daily') {
      return daily.map((d) => ({
        key: d.date,
        label: d.label,
        subLabel: d.date,
        amount: d.amount,
        count: d.count
      }));
    }
    if (timeframe === 'weekly') {
      return weekly.map((w) => ({
        key: w.week,
        label: w.label,
        subLabel: `${w.startDate} ถึง ${w.endDate}`,
        amount: w.amount,
        count: w.count
      }));
    }
    return monthly.map((m) => ({
      key: m.month,
      label: m.label,
      subLabel: m.month,
      amount: m.amount,
      count: m.count
    }));
  }, [timeframe, daily, weekly, monthly]);

  const stats = useMemo(() => {
    if (!activeData.length) return { total: 0, avg: 0, max: 0, maxLabel: '-', count: 0 };
    const total = activeData.reduce((sum, item) => sum + item.amount, 0);
    const count = activeData.reduce((sum, item) => sum + item.count, 0);
    const avg = activeData.length > 0 ? total / activeData.length : 0;
    let max = 0;
    let maxLabel = '-';
    activeData.forEach((item) => {
      if (item.amount > max) {
        max = item.amount;
        maxLabel = item.label;
      }
    });
    return { total, avg, max, maxLabel, count };
  }, [activeData]);

  // Chart SVG coordinate calculations
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxAmount = Math.max(...activeData.map((d) => d.amount), 100);
  // Round up max for nice grid lines
  const gridMax = Math.ceil(maxAmount / 100) * 100 || 500;

  // Grid steps (4 horizontal levels)
  const yTicks = [0, gridMax * 0.33, gridMax * 0.66, gridMax];

  const points = useMemo(() => {
    if (!activeData.length) return [];
    return activeData.map((d, i) => {
      const x =
        paddingLeft +
        (activeData.length > 1 ? (i / (activeData.length - 1)) * chartWidth : chartWidth / 2);
      const y = paddingTop + chartHeight - (d.amount / gridMax) * chartHeight;
      return { x, y, data: d, index: i };
    });
  }, [activeData, chartWidth, chartHeight, gridMax]);

  // SVG Area path & Line path
  const linePath = useMemo(() => {
    if (!points.length) return '';
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x},${p.y}`;
      return `${acc} L ${p.x},${p.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (!points.length) return '';
    const bottomY = paddingTop + chartHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${linePath} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
  }, [linePath, points, chartHeight]);

  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div className="analytics-card-title-group">
          <div className="analytics-icon-badge blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div>
            <h3 className="analytics-card-title">แนวโน้มรายได้ (Revenue Trends)</h3>
            <p className="analytics-card-subtitle">
              วิเคราะห์รายได้จากการสนับสนุนตามช่วงเวลา พร้อมเปรียบเทียบสถิติ
            </p>
          </div>
        </div>

        <div className="analytics-controls">
          {/* Chart Type Toggle */}
          <div className="btn-group-pill">
            <button
              type="button"
              className={`pill-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
              title="กราฟเส้นพื้นที่"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <span>พื้นที่</span>
            </button>
            <button
              type="button"
              className={`pill-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="กราฟแท่ง"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              <span>แท่ง</span>
            </button>
          </div>

          {/* Timeframe Select */}
          <div className="btn-group-pill">
            <button
              type="button"
              className={`pill-btn ${timeframe === 'daily' ? 'active' : ''}`}
              onClick={() => {
                setTimeframe('daily');
                setHoveredIndex(null);
              }}
            >
              รายวัน (30 วัน)
            </button>
            <button
              type="button"
              className={`pill-btn ${timeframe === 'weekly' ? 'active' : ''}`}
              onClick={() => {
                setTimeframe('weekly');
                setHoveredIndex(null);
              }}
            >
              รายสัปดาห์ (12 สัปดาห์)
            </button>
            <button
              type="button"
              className={`pill-btn ${timeframe === 'monthly' ? 'active' : ''}`}
              onClick={() => {
                setTimeframe('monthly');
                setHoveredIndex(null);
              }}
            >
              รายเดือน (12 เดือน)
            </button>
          </div>
        </div>
      </div>

      {/* Quick Trend Summary Pill Badges */}
      <div className="trend-summary-bar">
        <div className="summary-pill">
          <span className="summary-label">ยอดรวมช่วงนี้:</span>
          <span className="summary-value highlight">฿{stats.total.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="summary-pill">
          <span className="summary-label">จำนวนทำรายการ:</span>
          <span className="summary-value">{stats.count.toLocaleString()} ครั้ง</span>
        </div>
        <div className="summary-pill">
          <span className="summary-label">เฉลี่ยต่อช่วง:</span>
          <span className="summary-value">฿{Math.round(stats.avg).toLocaleString('th-TH')}</span>
        </div>
        {stats.max > 0 && (
          <div className="summary-pill">
            <span className="summary-label">ช่วงที่มียอดสูงสุด:</span>
            <span className="summary-value green">{stats.maxLabel} (฿{stats.max.toLocaleString()})</span>
          </div>
        )}
      </div>

      {/* SVG Interactive Chart Container */}
      <div className="chart-wrapper">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="responsive-svg-chart"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.38" />
              <stop offset="90%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis labels */}
          {yTicks.map((val, idx) => {
            const y = paddingTop + chartHeight - (val / gridMax) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--text-dim)"
                  fontFamily="inherit"
                >
                  ฿{val >= 1000 ? `${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Render Area/Line or Bar */}
          {chartType === 'area' && (
            <>
              {/* Shaded Area */}
              <path d={areaPath} fill="url(#areaGradient)" />

              {/* Main Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {points.map((p) => {
                const isHovered = hoveredIndex === p.index;
                return (
                  <circle
                    key={p.index}
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6 : p.data.amount > 0 ? 3.5 : 2}
                    fill={isHovered ? '#f59e0b' : '#2563eb'}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                );
              })}
            </>
          )}

          {/* Bar Chart Mode */}
          {chartType === 'bar' && (
            <>
              {points.map((p) => {
                const barWidth = Math.max(Math.min(chartWidth / activeData.length - 4, 24), 6);
                const barX = p.x - barWidth / 2;
                const barHeight = Math.max(chartHeight - (p.y - paddingTop), 3);
                const barY = paddingTop + chartHeight - barHeight;
                const isHovered = hoveredIndex === p.index;

                return (
                  <rect
                    key={p.index}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill={isHovered ? 'url(#barHoverGradient)' : 'url(#barGradient)'}
                    opacity={p.data.amount > 0 ? 0.95 : 0.25}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                );
              })}
            </>
          )}

          {/* X Axis Labels (sample evenly) */}
          {points.map((p, idx) => {
            const step = Math.ceil(points.length / 8);
            const isVisible = idx % step === 0 || idx === points.length - 1;
            if (!isVisible) return null;

            return (
              <text
                key={idx}
                x={p.x}
                y={svgHeight - 12}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-muted)"
                fontFamily="inherit"
              >
                {p.data.label}
              </text>
            );
          })}

          {/* Hover Crosshair Line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={paddingTop}
              x2={hoveredPoint.x}
              y2={paddingTop + chartHeight}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              strokeWidth="1.2"
            />
          )}

          {/* Invisible Overlay Hitboxes for easy hover */}
          {points.map((p) => {
            const sliceWidth = chartWidth / points.length;
            const hitX = p.x - sliceWidth / 2;

            return (
              <rect
                key={p.index}
                x={hitX}
                y={paddingTop}
                width={sliceWidth}
                height={chartHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIndex(p.index)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(hoveredPoint.x / svgWidth) * 100}%`,
              top: `${Math.max(10, (hoveredPoint.y / svgHeight) * 100 - 15)}%`
            }}
          >
            <div className="tooltip-date">{hoveredPoint.data.label}</div>
            <div className="tooltip-sub">{hoveredPoint.data.subLabel}</div>
            <div className="tooltip-amount">
              ฿{hoveredPoint.data.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
            <div className="tooltip-count">
              <span>จำนวน:</span> <strong>{hoveredPoint.data.count}</strong> รายการ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. PEAK HOURS CHART (24-Hour Distribution & Golden Hours)
// -------------------------------------------------------------
interface PeakHoursChartProps {
  hourly: HourlyDataPoint[];
  topHours: HourlyDataPoint[];
  peakWindow: string;
}

export function PeakHoursChart({ hourly, topHours, peakWindow }: PeakHoursChartProps) {
  const [hoveredHour, setHoveredHour] = useState<HourlyDataPoint | null>(null);

  const maxAmount = Math.max(...hourly.map((h) => h.amount), 1);
  const maxCount = Math.max(...hourly.map((h) => h.count), 1);

  // Set of top 3 peak hours for special highlighting
  const topHourSet = useMemo(() => {
    return new Set(topHours.map((h) => h.hour));
  }, [topHours]);

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div className="analytics-card-title-group">
          <div className="analytics-icon-badge amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <h3 className="analytics-card-title">ช่วงเวลาที่มีคนโดเนทมากที่สุด (Peak Hours 24 ชม.)</h3>
            <p className="analytics-card-subtitle">
              สถิติตลอดทั้งวันแบบรายชั่วโมง ช่วยวางแผนเวลาเปิดสตรีมหรือจัดแคมเปญ
            </p>
          </div>
        </div>

        <div className="peak-badge-highlight">
          <span className="flame-icon">🔥</span>
          <span className="peak-badge-text">ช่วงเวลาทอง: {peakWindow}</span>
        </div>
      </div>

      {/* Strategy Recommendation Banner */}
      <div className="golden-hour-advice">
        <div className="advice-icon">💡</div>
        <div className="advice-content">
          <strong>คำแนะนำสำหรับสตรีมเมอร์:</strong>{' '}
          {topHours.length > 0 ? (
            <>
              ชั่วโมงที่มียอดโดเนทสูงสุดคือ{' '}
              {topHours.map((h, i) => (
                <span key={h.hour} className="tag-hour">
                  #{i + 1} {h.label} น. (฿{h.amount.toLocaleString()})
                </span>
              ))}
              {' '}แนะนำให้ขึ้นสตรีมหรือเปิดกิจกรรม Challenge ในช่วงเวลานี้ เพื่อโอกาสรับการสนับสนุนสูงสุด
            </>
          ) : (
            'ยังไม่มีข้อมูลการบริจาคเพียงพอ ระบบจะคำนวณช่วงเวลาที่มีการโดเนทหนาแน่นให้อัตโนมัติเมื่อเริ่มมียอดสตรีม'
          )}
        </div>
      </div>

      {/* 24-Hour Bar Matrix */}
      <div className="peak-hours-grid-container">
        <div className="peak-hours-bars">
          {hourly.map((item) => {
            const isTop = topHourSet.has(item.hour);
            const heightPercent = item.amount > 0 ? Math.max((item.amount / maxAmount) * 100, 10) : 4;
            const isHovered = hoveredHour?.hour === item.hour;

            return (
              <div
                key={item.hour}
                className={`peak-bar-col ${isTop ? 'is-peak' : ''} ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredHour(item)}
                onMouseLeave={() => setHoveredHour(null)}
              >
                {/* Bar */}
                <div className="peak-bar-track">
                  <div
                    className={`peak-bar-fill ${isTop ? 'golden' : item.amount > 0 ? 'active' : 'idle'}`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {isTop && <span className="top-indicator">★</span>}
                  </div>
                </div>

                {/* Hour Label */}
                <span className="peak-hour-label">{item.hour}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Detail Card on Hover */}
        <div className="peak-hover-detail">
          {hoveredHour ? (
            <div className="detail-active-row">
              <span className="detail-time">
                ⏰ ช่วงเวลา <strong>{hoveredHour.label} - {String((hoveredHour.hour + 1) % 24).padStart(2, '0')}:00 น.</strong>
              </span>
              <span className="detail-amount">
                ยอดรวม: <strong className="green">฿{hoveredHour.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
              </span>
              <span className="detail-count">
                จำนวน: <strong>{hoveredHour.count} ครั้ง</strong>
              </span>
              <span className="detail-pct">
                สัดส่วน: <strong>{hoveredHour.percentage}%</strong> ของยอดทั้งหมด
              </span>
            </div>
          ) : (
            <div className="detail-hint">
              <span>👉 วางเมาส์เหนือแท่งกราฟชั่วโมง เพื่อดูสถิติรายได้และจำนวนครั้งของแต่ละช่วงเวลา</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. TOP DONATORS LEADERBOARD (Monthly & All-time)
// -------------------------------------------------------------
interface TopDonatorsLeaderboardProps {
  donators: TopDonator[];
  allTimeDonators: TopDonator[];
  availableMonths: { key: string; label: string; count: number; total: number }[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function TopDonatorsLeaderboard({
  donators,
  allTimeDonators,
  availableMonths,
  selectedMonth,
  onMonthChange
}: TopDonatorsLeaderboardProps) {
  const [viewMode, setViewMode] = useState<'month' | 'alltime'>('month');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const activeList = viewMode === 'month' ? donators : allTimeDonators;

  const filteredList = useMemo(() => {
    if (!searchFilter.trim()) return activeList;
    return activeList.filter((d) =>
      d.name.toLowerCase().includes(searchFilter.toLowerCase().trim())
    );
  }, [activeList, searchFilter]);

  const topDonationAmount = activeList.length > 0 ? activeList[0].totalAmount : 1;

  const totalLeaderboardAmount = useMemo(() => {
    return activeList.reduce((sum, d) => sum + d.totalAmount, 0);
  }, [activeList]);

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div className="analytics-card-title-group">
          <div className="analytics-icon-badge purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
          </div>
          <div>
            <h3 className="analytics-card-title">
              รายชื่อ Top Donator {viewMode === 'month' ? 'ประจำเดือน' : 'ตลอดกาล'}
            </h3>
            <p className="analytics-card-subtitle">
              ผู้สนับสนุนที่มียอดบริจาครวมสูงสุด จัดอันดับพร้อมรายละเอียด
            </p>
          </div>
        </div>

        <div className="analytics-controls">
          {/* View Mode Toggle */}
          <div className="btn-group-pill">
            <button
              type="button"
              className={`pill-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              ประจำเดือน
            </button>
            <button
              type="button"
              className={`pill-btn ${viewMode === 'alltime' ? 'active' : ''}`}
              onClick={() => setViewMode('alltime')}
            >
              ตลอดกาล (All-Time)
            </button>
          </div>

          {/* Month Dropdown (visible in month mode) */}
          {viewMode === 'month' && (
            <div className="select-wrapper">
              <select
                className="input-select"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
              >
                {availableMonths.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label} ({m.count} รายการ)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="leaderboard-meta-bar">
        <div className="search-box-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="ค้นหาชื่อผู้สนับสนุน..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
          {searchFilter && (
            <button type="button" className="clear-search" onClick={() => setSearchFilter('')}>
              ✕
            </button>
          )}
        </div>

        <div className="meta-stats">
          <span>ผู้สนับสนุนรวม: <strong>{activeList.length} คน</strong></span>
          <span className="dot">•</span>
          <span>ยอดรวมกลุ่มนี้: <strong className="green">฿{totalLeaderboardAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></span>
        </div>
      </div>

      {/* Leaderboard Table / List */}
      {filteredList.length === 0 ? (
        <div className="empty-leaderboard">
          <div className="empty-icon">🪙</div>
          <p className="empty-title">ยังไม่มีข้อมูลผู้สนับสนุนสำหรับช่วงเวลานี้</p>
          <p className="empty-sub">เมื่อมีคนโดเนทและผ่านการตรวจสอบ รายชื่อจะมาแสดงในกระดานนี้ทันที</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ width: '70px', textAlign: 'center' }}>อันดับ</th>
                <th>ผู้สนับสนุน</th>
                <th style={{ textAlign: 'right' }}>ยอดบริจาครวม</th>
                <th style={{ width: '22%', minWidth: '130px' }}>สัดส่วนเทียบอันดับ 1</th>
                <th style={{ textAlign: 'center' }}>จำนวนครั้ง</th>
                <th style={{ textAlign: 'right' }}>ยอดสูงสุด/ครั้ง</th>
                <th style={{ textAlign: 'right' }}>ล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((donor) => {
                const ratioPercent = topDonationAmount > 0 ? (donor.totalAmount / topDonationAmount) * 100 : 0;
                const initialLetter = (donor.name || 'A')[0].toUpperCase();

                return (
                  <tr key={donor.name} className={donor.rank <= 3 ? `top-row rank-${donor.rank}` : ''}>
                    {/* Rank Badge */}
                    <td style={{ textAlign: 'center' }}>
                      {donor.rank === 1 && <span className="rank-badge gold" title="อันดับ 1">🥇 1</span>}
                      {donor.rank === 2 && <span className="rank-badge silver" title="อันดับ 2">🥈 2</span>}
                      {donor.rank === 3 && <span className="rank-badge bronze" title="อันดับ 3">🥉 3</span>}
                      {donor.rank > 3 && <span className="rank-badge regular">#{donor.rank}</span>}
                    </td>

                    {/* Donor Name & Avatar */}
                    <td>
                      <div className="donor-profile-cell">
                        <div className={`donor-avatar rank-${donor.rank <= 3 ? donor.rank : 'default'}`}>
                          {initialLetter}
                        </div>
                        <span className="donor-name">{donor.name}</span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td style={{ textAlign: 'right' }}>
                      <span className="amount-highlight">
                        ฿{donor.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Visual Comparison Progress Bar */}
                    <td>
                      <div className="ratio-bar-wrapper">
                        <div className="ratio-bar-track">
                          <div
                            className={`ratio-bar-fill ${donor.rank <= 3 ? `rank-${donor.rank}` : ''}`}
                            style={{ width: `${Math.max(ratioPercent, 4)}%` }}
                          />
                        </div>
                        <span className="ratio-text">{Math.round(ratioPercent)}%</span>
                      </div>
                    </td>

                    {/* Donation Count */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-count">{donor.count} ครั้ง</span>
                    </td>

                    {/* Highest Single Donation */}
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      ฿{donor.topSingle.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Last Donated Date */}
                    <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {donor.lastDonatedAt ? new Date(donor.lastDonatedAt).toLocaleDateString('th-TH') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
