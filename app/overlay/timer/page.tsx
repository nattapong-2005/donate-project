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

  // URL query parameter background override (?bg=0, ?bg=false, ?nobg=1, ?transparent=1)
  const [urlBgOverride, setUrlBgOverride] = useState<boolean | null>(null);
  const [urlShadowOverride, setUrlShadowOverride] = useState<boolean | null>(null);
  const [urlShadowColor, setUrlShadowColor] = useState<string | null>(null);
  const [urlShadowBlur, setUrlShadowBlur] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('bg')) {
        const val = params.get('bg');
        setUrlBgOverride(val !== '0' && val !== 'false' && val !== 'none');
      } else if (params.has('nobg') || params.has('transparent')) {
        setUrlBgOverride(false);
      }

      if (params.has('shadow')) {
        const s = params.get('shadow');
        setUrlShadowOverride(s !== '0' && s !== 'false' && s !== 'none');
      }
      if (params.has('shadow_color')) {
        const col = params.get('shadow_color');
        if (col) setUrlShadowColor(col.startsWith('#') ? col : `#${col}`);
      }
      if (params.has('shadow_blur')) {
        const b = Number(params.get('shadow_blur'));
        if (!isNaN(b)) setUrlShadowBlur(b);
      }
    }
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

  const isBackgroundVisible =
    urlBgOverride !== null
      ? urlBgOverride
      : (appearance.show_background !== undefined ? appearance.show_background : true);

  const isShadowEnabled =
    urlShadowOverride !== null
      ? urlShadowOverride
      : (appearance.show_digits_shadow !== false);

  const shadowX = appearance.digits_shadow_x ?? 0;
  const shadowY = appearance.digits_shadow_y ?? 2;
  const shadowBlur = urlShadowBlur !== null ? urlShadowBlur : (appearance.digits_shadow_blur ?? 8);
  const shadowColor = urlShadowColor || appearance.digits_shadow_color || '#000000';

  const digitsTextShadow = isShadowEnabled
    ? `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`
    : 'none';

  const themeClass = `timer-theme-${appearance.theme || 'glass'}`;
  const opacityHex = Math.round(Number(appearance.opacity || 90) * 2.55)
    .toString(16)
    .padStart(2, '0');

  const containerStyle: React.CSSProperties = {
    fontFamily: `'${appearance.font || 'LINESeedSansTH'}', sans-serif`,
    width: `${appearance.width || 480}px`,
    maxWidth: '96vw',
    padding: isBackgroundVisible ? `${appearance.padding || 24}px` : `${Math.min(appearance.padding || 16, 20)}px 12px`,
    borderRadius: isBackgroundVisible ? `${appearance.radius || 20}px` : '0px',
    borderColor: isBackgroundVisible ? (appearance.border_color || '#334155') : 'transparent',
    color: appearance.text_color || '#ffffff',
    backgroundColor: isBackgroundVisible ? `${appearance.bg_color || '#0f172a'}${opacityHex}` : 'transparent',
    boxShadow: isBackgroundVisible ? undefined : 'none',
    border: isBackgroundVisible ? undefined : 'none',
    backdropFilter: isBackgroundVisible ? undefined : 'none',
    WebkitBackdropFilter: isBackgroundVisible ? undefined : 'none',
    '--timer-accent': appearance.accent_color || '#38bdf8',
    '--digits-text-shadow': digitsTextShadow
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
      <div className={`timer-widget-container ${themeClass} ${!isBackgroundVisible ? 'no-background' : ''}`} style={containerStyle}>
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
          <span className="timer-digits" style={{ textShadow: digitsTextShadow }}>{formatted}</span>
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
