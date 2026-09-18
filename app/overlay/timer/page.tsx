'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './timer.css';
import { supabase } from '@/lib/supabaseClient';
import {
  computeRemainingSeconds,
  formatDeltaDisplay,
  formatTimerDisplay
} from '@/lib/timerLogic';
import {
  defaultTimerAppearance,
  TimerAppearance,
  TimerEventPayload,
  TimerStatus
} from '@/lib/timerTypes';

interface FloatingBadge {
  id: string;
  delta: number;
  donorName: string;
}

export default function TimerOverlayPage() {
  const [status, setStatus] = useState<TimerStatus>('paused');
  const [baseRemaining, setBaseRemaining] = useState<number>(3600);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>(new Date(0).toISOString());
  const [appearance, setAppearance] = useState<TimerAppearance>(defaultTimerAppearance);
  const [displaySeconds, setDisplaySeconds] = useState<number>(3600);
  const [pulseClass, setPulseClass] = useState<string>('');
  const [floatingBadges, setFloatingBadges] = useState<FloatingBadge[]>([]);
  const [latestDonor, setLatestDonor] = useState<{
    name: string;
    delta: number;
    amount?: number;
  } | null>(null);

  // Keep refs for event handlers and intervals
  const stateRef = useRef({
    status: 'paused' as TimerStatus,
    baseRemaining: 3600,
    lastUpdatedAt: new Date(0).toISOString()
  });

  useEffect(() => {
    stateRef.current = { status, baseRemaining, lastUpdatedAt };
  }, [status, baseRemaining, lastUpdatedAt]);

  // Initial class on body
  useEffect(() => {
    document.body.classList.add('timer-overlay-body');
    return () => {
      document.body.classList.remove('timer-overlay-body');
    };
  }, []);

  // Fetch initial timer data
  const fetchTimerData = useCallback(async () => {
    try {
      const res = await fetch('/api/timer', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data.status);
        setBaseRemaining(data.data.remaining_seconds);
        setLastUpdatedAt(data.data.last_updated_at);
        if (data.data.appearance) {
          setAppearance(prev => ({ ...prev, ...data.data.appearance }));
        }
        setDisplaySeconds(data.data.remaining_seconds);
      }
    } catch (err) {
      console.warn('Failed to load timer state:', err);
    }
  }, []);

  // Trigger floating badge and pulse animation
  const triggerTimeChangeAnimation = useCallback((delta: number, donorName?: string) => {
    if (!delta || delta === 0) return;

    // 1. Add floating badge
    const badgeId = 'badge-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const newBadge: FloatingBadge = {
      id: badgeId,
      delta,
      donorName: donorName || (delta > 0 ? 'โดเนทเพิ่มเวลา' : 'โดเนทลดเวลา')
    };

    setFloatingBadges(prev => [...prev.slice(-3), newBadge]);
    setTimeout(() => {
      setFloatingBadges(prev => prev.filter(b => b.id !== badgeId));
    }, 3200);

    // 2. Pulse effect on digits
    setPulseClass(delta > 0 ? 'timer-pulse-green' : 'timer-pulse-red');
    setTimeout(() => {
      setPulseClass('');
    }, 700);

    // 3. Update footer latest donor
    if (donorName) {
      setLatestDonor({ name: donorName, delta });
    }
  }, []);

  // Realtime Supabase subscription
  useEffect(() => {
    void fetchTimerData();

    const channel = supabase.channel('donation-alerts');

    channel
      .on('broadcast', { event: 'timer_update' }, (payload: any) => {
        const data = payload.payload as TimerEventPayload & { appearance?: TimerAppearance };
        if (!data) return;

        if (data.status) setStatus(data.status);
        if (typeof data.remaining_seconds === 'number') {
          setBaseRemaining(data.remaining_seconds);
          setDisplaySeconds(data.remaining_seconds);
        }
        if (data.last_updated_at) setLastUpdatedAt(data.last_updated_at);
        if (data.appearance) {
          setAppearance(prev => ({ ...prev, ...data.appearance }));
        }

        if (data.delta_seconds && data.delta_seconds !== 0) {
          triggerTimeChangeAnimation(data.delta_seconds, data.donor_name);
        }
      })
      .on('broadcast', { event: 'settings_updated' }, () => {
        void fetchTimerData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTimerData, triggerTimeChangeAnimation]);

  // High-precision countdown loop (zero drift)
  useEffect(() => {
    const interval = setInterval(() => {
      const { status: curStatus, baseRemaining: curRemaining, lastUpdatedAt: curUpdated } = stateRef.current;
      const current = computeRemainingSeconds({
        timer_status: curStatus,
        timer_remaining_seconds: curRemaining,
        timer_last_updated_at: curUpdated
      });

      setDisplaySeconds(current);

      if (current <= 0 && curStatus === 'running') {
        setStatus('stopped');
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Test / preview badge
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('test') === '1' || params.get('preview') === '1') {
        const timer = setTimeout(() => {
          triggerTimeChangeAnimation(300, 'ผู้ชมตัวอย่าง (ทดสอบ)');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [triggerTimeChangeAnimation]);

  const { formatted, isZero } = formatTimerDisplay(displaySeconds);

  const themeClass = `timer-theme-${appearance.theme || 'glass'}`;
  const opacityHex = Math.round(Number(appearance.opacity || 90) * 2.55)
    .toString(16)
    .padStart(2, '0');

  const containerStyle: React.CSSProperties = {
    fontFamily: `'${appearance.font || 'LINESeedSansTH'}', sans-serif`,
    width: `${appearance.width || 480}px`,
    maxWidth: '96vw',
    padding: `${appearance.padding || 24}px`,
    borderRadius: `${appearance.radius || 20}px`,
    borderColor: appearance.border_color || '#334155',
    color: appearance.text_color || '#ffffff',
    backgroundColor: `${appearance.bg_color || '#0f172a'}${opacityHex}`,
    '--timer-accent': appearance.accent_color || '#38bdf8'
  } as React.CSSProperties;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'transparent',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div className={`timer-widget-container ${themeClass}`} style={containerStyle}>
        {/* Floating Animation Badges */}
        <div className="timer-floating-badge-container">
          {floatingBadges.map(badge => (
            <div
              key={badge.id}
              className={`timer-floating-badge ${badge.delta >= 0 ? 'badge-add' : 'badge-subtract'}`}
            >
              <span className="badge-donor-name">{badge.donorName}</span>
              <span className="badge-time-delta">{formatDeltaDisplay(badge.delta)}</span>
            </div>
          ))}
        </div>

        {/* Header Title */}
        {appearance.show_title && (
          <div className="timer-header">
            <span
              className="timer-title-text"
              style={{
                fontSize: `${appearance.title_size || 16}px`,
                color: appearance.accent_color || '#38bdf8'
              }}
            >
              {appearance.title || '⏱️ SUBATHON TIMER'}
            </span>

            {/* Status Indicator */}
            {status === 'paused' && (
              <span className="timer-status-badge status-badge-paused">PAUSED</span>
            )}
            {status === 'stopped' && isZero && (
              <span className="timer-status-badge status-badge-ended">ENDED</span>
            )}
          </div>
        )}

        {/* Main Countdown Digits */}
        <div
          className={`timer-digits-wrapper ${pulseClass} ${isZero ? 'timer-zero-warning' : ''}`}
          style={{ fontSize: `${appearance.digits_size || 54}px` }}
        >
          <span className="timer-digits">{formatted}</span>
        </div>

        {/* Footer / Latest Donor Attribution */}
        {appearance.show_donor_badge && latestDonor && (
          <div className="timer-footer">
            <span className="timer-latest-donor">
              <span>ล่าสุด:</span>
              <strong>{latestDonor.name}</strong>
              <span style={{ color: latestDonor.delta >= 0 ? '#4ade80' : '#f87171' }}>
                ({formatDeltaDisplay(latestDonor.delta)})
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
