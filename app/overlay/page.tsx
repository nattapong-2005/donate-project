'use client';

import React, { useEffect, useRef, useState } from 'react';
import './overlay.css';
import { supabase } from '@/lib/supabaseClient';
import { Donation, AlertSettings } from '@/lib/types/database';

const ICONS: Record<string, React.ReactNode> = {
  gift: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"></polyline>
      <rect x="2" y="7" width="20" height="5"></rect>
      <line x1="12" y1="22" x2="12" y2="7"></line>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
  ),
  heart: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  coin: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
      <path d="M12 6v2m0 8v2"></path>
    </svg>
  ),
  star: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  fire: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
  ),
  trophy: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
      <path d="M4 22h16"></path>
      <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34"></path>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
    </svg>
  )
};

export default function OverlayPage() {
  const [currentAlert, setCurrentAlert] = useState<Donation | null>(null);
  const [alertAnimState, setAlertAnimState] = useState<string>('');
  const [settings, setSettings] = useState<AlertSettings>({
    alert_duration: 8,
    alert_volume: 80,
    tts_enabled: 'true',
    tts_min_amount: 20,
    alert_animation: 'slide-down',
    alert_action_text: 'โดเนทให้',
    alert_icon: 'gift',
  });

  const queueRef = useRef<Donation[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const settingsRef = useRef<AlertSettings>(settings);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.body.classList.add('overlay-body');
    return () => {
      document.body.classList.remove('overlay-body');
    };
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
    applyStyles(settings);
  }, [settings]);

  function applyStyles(s: AlertSettings) {
    if (!s || typeof window === 'undefined') return;
    const root = document.documentElement;

    if (s.alert_font) root.style.setProperty('--alert-font', `'${s.alert_font}', sans-serif`);
    if (s.alert_card_bg) root.style.setProperty('--alert-card-bg', s.alert_card_bg);
    if (s.alert_card_blur !== undefined) root.style.setProperty('--alert-card-blur', `${s.alert_card_blur}px`);
    if (s.alert_card_width) root.style.setProperty('--alert-card-width', `${s.alert_card_width}px`);

    if (s.alert_border_color) root.style.setProperty('--alert-border-color', s.alert_border_color);
    if (s.alert_border_width !== undefined) root.style.setProperty('--alert-border-width', `${s.alert_border_width}px`);
    if (s.alert_border_radius !== undefined) root.style.setProperty('--alert-border-radius', `${s.alert_border_radius}px`);

    if (s.alert_shimmer_color) root.style.setProperty('--alert-shimmer', s.alert_shimmer_color);
    root.style.setProperty('--alert-shimmer-display', (s.alert_shimmer_show === 'false' || s.alert_shimmer_show === false) ? 'none' : 'block');

    if (s.alert_shadow_show === 'false' || s.alert_shadow_show === false) {
      root.style.setProperty('--alert-shadow', 'none');
    } else if (s.alert_glow === 'true' || s.alert_glow === true) {
      const glowColor = s.alert_border_color && s.alert_border_color !== 'transparent' ? s.alert_border_color : '#2563eb';
      root.style.setProperty('--alert-shadow', `0 25px 50px -12px rgba(0,0,0,0.3), 0 0 35px ${glowColor}66`);
    } else {
      root.style.setProperty('--alert-shadow', '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.04)');
    }

    if (s.alert_icon_bg) root.style.setProperty('--alert-icon-bg', s.alert_icon_bg);
    if (s.alert_icon_color) root.style.setProperty('--alert-icon-color', s.alert_icon_color);
    if (s.alert_icon_border) root.style.setProperty('--alert-icon-border', s.alert_icon_border);
    root.style.setProperty('--alert-icon-border-width', s.alert_icon_bg === 'transparent' ? '0px' : '1.5px');
    root.style.setProperty('--alert-icon-shadow', s.alert_icon_bg === 'transparent' ? 'none' : '0 4px 12px rgba(15, 23, 42, 0.05)');

    if (s.alert_name_color) root.style.setProperty('--alert-name-color', s.alert_name_color);
    if (s.alert_action_color) root.style.setProperty('--alert-action-color', s.alert_action_color);
    if (s.alert_title_size) root.style.setProperty('--alert-title-size', `${s.alert_title_size}px`);

    if (s.alert_amount_bg) root.style.setProperty('--alert-amount-bg', s.alert_amount_bg);
    if (s.alert_amount_color) root.style.setProperty('--alert-amount-color', s.alert_amount_color);
    if (s.alert_amount_border) root.style.setProperty('--alert-amount-border', s.alert_amount_border);
    if (s.alert_amount_size) root.style.setProperty('--alert-amount-size', `${s.alert_amount_size}px`);
    root.style.setProperty('--alert-amount-border-width', s.alert_amount_bg === 'transparent' ? '0px' : '1.5px');
    root.style.setProperty('--alert-amount-padding', s.alert_amount_bg === 'transparent' ? '0px' : '2px 14px');

    if (s.alert_msg_bg) root.style.setProperty('--alert-msg-bg', s.alert_msg_bg);
    if (s.alert_msg_color) root.style.setProperty('--alert-msg-color', s.alert_msg_color);
    if (s.alert_msg_border) root.style.setProperty('--alert-msg-border', s.alert_msg_border);
    if (s.alert_msg_size) root.style.setProperty('--alert-msg-size', `${s.alert_msg_size}px`);
  }

  function playSynthesizedChime(volumePercent: number) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime((volumePercent / 100) * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + (index * 0.08);
        const duration = 0.6;

        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn('Audio synthesis warning:', e);
    }
  }

  function playAlertSound() {
    const vol = parseFloat(String(settingsRef.current.alert_volume || 80));
    if (audioRef.current) {
      audioRef.current.volume = Math.min(Math.max(vol / 100, 0), 1);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        playSynthesizedChime(vol);
      });
    } else {
      playSynthesizedChime(vol);
    }
  }

  function speakDonation(item: Donation) {
    const s = settingsRef.current;
    if (s.tts_enabled !== 'true' && s.tts_enabled !== true) return;
    if (!('speechSynthesis' in window)) return;

    const minAmt = parseFloat(String(s.tts_min_amount || 0));
    const itemAmt = parseFloat(String(item.amount || 0));
    if (itemAmt < minAmt) return;

    window.speechSynthesis.cancel();

    const donorName = item.name?.trim() || 'Anonymous';
    const actionText = (s.alert_action_text || 'โดเนทให้').trim();
    let textToSpeak = `${donorName} ${actionText} ${itemAmt} บาท`;
    if (item.message && item.message.trim() !== '') {
      textToSpeak += ` ${item.message.trim()}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'th-TH';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = Math.min(Math.max(parseFloat(String(s.alert_volume || 80)) / 100, 0), 1);

    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(v => v.lang.startsWith('th'));
    if (thaiVoice) utterance.voice = thaiVoice;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 1200);
  }

  function processQueue() {
    if (isPlayingRef.current || queueRef.current.length === 0) return;

    isPlayingRef.current = true;
    const item = queueRef.current.shift()!;
    setCurrentAlert(item);

    playAlertSound();
    speakDonation(item);

    setAlertAnimState('show');

    const durationSec = parseFloat(String(settingsRef.current.alert_duration || 8));
    const durationMs = durationSec * 1000;

    setTimeout(() => {
      setAlertAnimState('hide');
      setTimeout(() => {
        setAlertAnimState('');
        setCurrentAlert(null);
        isPlayingRef.current = false;
        processQueue();
      }, 500);
    }, durationMs);
  }

  const [connStatus, setConnStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isOBS, setIsOBS] = useState<boolean>(false);

  function handleIncomingDonation(data: Donation) {
    console.log('[OBS Overlay] Received donation alert:', data);
    queueRef.current.push(data);
    processQueue();
  }

  function triggerTestAlert() {
    handleIncomingDonation({
      id: 'test-preview-' + Date.now(),
      name: 'ผู้ชมทดสอบระบบ',
      amount: 100,
      message: 'ทดสอบเสียงแจ้งเตือนและการแสดงผลบนหน้าจอ OBS สำเร็จ!',
      sender_bank: 'PROMPTPAY',
      created_at: new Date().toLocaleTimeString('th-TH'),
      isTest: true
    });
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOBS(Boolean((window as any).obsstudio) || navigator.userAgent.includes('OBS'));
      const params = new URLSearchParams(window.location.search);
      if (params.get('test') === '1' || params.get('preview') === '1') {
        setTimeout(() => {
          triggerTestAlert();
        }, 800);
      }
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.settings) {
          setSettings(prev => ({ ...prev, ...res.settings }));
        }
      })
      .catch(err => console.warn('Could not load initial settings:', err));

    const channel = supabase.channel('donation-alerts');

    channel
      .on('broadcast', { event: 'donation' }, (payload: any) => {
        if (payload.payload) handleIncomingDonation(payload.payload);
      })
      .on('broadcast', { event: 'settings_updated' }, (payload: any) => {
        if (payload.payload) {
          console.log('[OBS Overlay] Settings updated live:', payload.payload);
          setSettings(prev => ({ ...prev, ...payload.payload }));
        }
      })
      .subscribe((status: string) => {
        console.log('[OBS Overlay] Supabase Realtime connection status:', status);
        if (status === 'SUBSCRIBED') {
          setConnStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnStatus('error');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const animClass = `anim-${settings.alert_animation || 'slide-down'}`;
  const iconKey = settings.alert_icon || 'gift';
  const IconComponent = ICONS[iconKey] || ICONS.gift;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '50px',
      overflow: 'hidden',
      background: 'transparent',
      position: 'relative'
    }}>
      <audio ref={audioRef} src="/sounds/alert.mp3" preload="auto" />

      {/* Floating Helper Toolbar when viewed directly in browser (auto-hidden in OBS or during active alert) */}
      {!currentAlert && !isOBS && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(10px)',
          padding: '10px 18px',
          borderRadius: '999px',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 9999,
          userSelect: 'none',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: connStatus === 'connected' ? '#10b981' : connStatus === 'error' ? '#ef4444' : '#f59e0b',
              boxShadow: connStatus === 'connected' ? '0 0 8px #10b981' : 'none'
            }} />
            <span style={{ color: '#e2e8f0', fontSize: '12.5px' }}>
              {connStatus === 'connected' ? 'Realtime Connected' : connStatus === 'error' ? 'Connection Error' : 'กำลังเชื่อมต่อ...'}
            </span>
          </span>

          <span style={{ color: '#475569' }}>|</span>

          <button
            type="button"
            onClick={triggerTestAlert}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
          >
            ⚡ กดเพื่อทดสอบ Alert
          </button>
        </div>
      )}

      <div className={`alert-wrapper ${animClass} ${alertAnimState}`}>
        {currentAlert && (
          <div className="alert-card">
            <div className="alert-shimmer" />

            <div className="alert-icon-wrap">
              {IconComponent}
            </div>

            <div className="alert-title alert-headline">
              <span className="donator-name">{currentAlert.name || 'ผู้สนับสนุน'}</span>
              <span className="alert-action-text">{settings.alert_action_text || 'โดเนทให้'}</span>
              <span className="alert-amount-wrap">
                <span className="alert-amount-val">
                  {(parseFloat(String(currentAlert.amount)) || 0).toLocaleString('th-TH')}
                </span>
                <span className="alert-currency">บาท</span>
              </span>
            </div>

            {currentAlert.message && currentAlert.message.trim() !== '' && (
              <div className="alert-message">
                {currentAlert.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
