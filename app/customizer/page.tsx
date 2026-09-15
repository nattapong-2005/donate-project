'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '../admin/admin.css';
import '../overlay/overlay.css';
import './customizer.css';
import { AlertSettings } from '@/lib/types/database';
import { Sidebar, MobileTopBar } from '@/app/components';

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

const PRESETS: Record<string, Partial<AlertSettings>> = {
  frameless_clear: {
    alert_theme: 'frameless_clear',
    alert_font: 'LINESeedSansTH',
    alert_card_bg: 'transparent',
    alert_card_blur: 0,
    alert_card_width: 580,
    alert_border_color: 'transparent',
    alert_border_width: 0,
    alert_border_radius: 0,
    alert_shimmer_color: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
    alert_shimmer_show: 'false',
    alert_icon: 'gift',
    alert_icon_bg: 'transparent',
    alert_icon_color: '#38bdf8',
    alert_icon_border: 'transparent',
    alert_name_color: '#38bdf8',
    alert_action_text: 'โดเนทให้',
    alert_action_color: '#e2e8f0',
    alert_title_size: 28,
    alert_amount_bg: 'transparent',
    alert_amount_color: '#22c55e',
    alert_amount_border: 'transparent',
    alert_amount_size: 26,
    alert_msg_bg: 'transparent',
    alert_msg_color: '#ffffff',
    alert_msg_border: 'transparent',
    alert_msg_size: 18,
    alert_animation: 'slide-down',
    alert_glow: 'false',
    alert_shadow_show: 'false'
  },
  modern_light: {
    alert_theme: 'modern_light',
    alert_font: 'LINESeedSansTH',
    alert_card_bg: '#ffffff',
    alert_card_blur: 0,
    alert_card_width: 580,
    alert_border_color: '#e2e8f0',
    alert_border_width: 1.5,
    alert_border_radius: 24,
    alert_shimmer_color: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #059669 100%)',
    alert_shimmer_show: 'true',
    alert_icon: 'gift',
    alert_icon_bg: '#f8fafc',
    alert_icon_color: '#0f172a',
    alert_icon_border: '#e2e8f0',
    alert_name_color: '#0f172a',
    alert_action_text: 'โดเนทให้',
    alert_action_color: '#64748b',
    alert_title_size: 26,
    alert_amount_bg: '#ecfdf5',
    alert_amount_color: '#059669',
    alert_amount_border: '#a7f3d0',
    alert_amount_size: 22,
    alert_msg_bg: '#f8fafc',
    alert_msg_color: '#334155',
    alert_msg_border: '#e2e8f0',
    alert_msg_size: 18,
    alert_animation: 'slide-down',
    alert_glow: 'false',
    alert_shadow_show: 'true'
  },
  dark_luxury: {
    alert_theme: 'dark_luxury',
    alert_font: 'Kanit',
    alert_card_bg: '#0f172a',
    alert_card_blur: 0,
    alert_card_width: 580,
    alert_border_color: '#334155',
    alert_border_width: 2,
    alert_border_radius: 24,
    alert_shimmer_color: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
    alert_shimmer_show: 'true',
    alert_icon: 'trophy',
    alert_icon_bg: '#1e293b',
    alert_icon_color: '#fbbf24',
    alert_icon_border: '#b45309',
    alert_name_color: '#f8fafc',
    alert_action_text: 'โดเนทให้',
    alert_action_color: '#94a3b8',
    alert_title_size: 26,
    alert_amount_bg: '#451a03',
    alert_amount_color: '#fbbf24',
    alert_amount_border: '#b45309',
    alert_amount_size: 22,
    alert_msg_bg: '#1e293b',
    alert_msg_color: '#e2e8f0',
    alert_msg_border: '#334155',
    alert_msg_size: 18,
    alert_animation: 'slide-down',
    alert_glow: 'true',
    alert_shadow_show: 'true'
  },
  cyber_neon: {
    alert_theme: 'cyber_neon',
    alert_font: 'Chakra Petch',
    alert_card_bg: '#090d16',
    alert_card_blur: 0,
    alert_card_width: 600,
    alert_border_color: '#06b6d4',
    alert_border_width: 2,
    alert_border_radius: 14,
    alert_shimmer_color: 'linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)',
    alert_shimmer_show: 'true',
    alert_icon: 'fire',
    alert_icon_bg: '#0f172a',
    alert_icon_color: '#38bdf8',
    alert_icon_border: '#06b6d4',
    alert_name_color: '#f43f5e',
    alert_action_text: 'ส่งพลังโดเนท!',
    alert_action_color: '#38bdf8',
    alert_title_size: 26,
    alert_amount_bg: '#1e1b4b',
    alert_amount_color: '#38bdf8',
    alert_amount_border: '#818cf8',
    alert_amount_size: 24,
    alert_msg_bg: '#0f172a',
    alert_msg_color: '#e0e7ff',
    alert_msg_border: '#334155',
    alert_msg_size: 18,
    alert_animation: 'bounce',
    alert_glow: 'true',
    alert_shadow_show: 'true'
  },
  sweet_pastel: {
    alert_theme: 'sweet_pastel',
    alert_font: 'Mitr',
    alert_card_bg: '#fff5f7',
    alert_card_blur: 0,
    alert_card_width: 560,
    alert_border_color: '#fecdd3',
    alert_border_width: 2,
    alert_border_radius: 28,
    alert_shimmer_color: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 50%, #fda4af 100%)',
    alert_shimmer_show: 'true',
    alert_icon: 'heart',
    alert_icon_bg: '#ffe4e6',
    alert_icon_color: '#e11d48',
    alert_icon_border: '#fecdd3',
    alert_name_color: '#9f1239',
    alert_action_text: 'ส่งหัวใจให้แล้ว!',
    alert_action_color: '#fb7185',
    alert_title_size: 26,
    alert_amount_bg: '#fce7f3',
    alert_amount_color: '#be185d',
    alert_amount_border: '#f472b6',
    alert_amount_size: 22,
    alert_msg_bg: '#ffffff',
    alert_msg_color: '#881337',
    alert_msg_border: '#fecdd3',
    alert_msg_size: 18,
    alert_animation: 'bounce',
    alert_glow: 'false',
    alert_shadow_show: 'true'
  },
  glass_frost: {
    alert_theme: 'glass_frost',
    alert_font: 'Prompt',
    alert_card_bg: 'rgba(255, 255, 255, 0.75)',
    alert_card_blur: 16,
    alert_card_width: 580,
    alert_border_color: 'rgba(255, 255, 255, 0.7)',
    alert_border_width: 2,
    alert_border_radius: 24,
    alert_shimmer_color: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
    alert_shimmer_show: 'true',
    alert_icon: 'coin',
    alert_icon_bg: '#eff6ff',
    alert_icon_color: '#2563eb',
    alert_icon_border: '#bfdbfe',
    alert_name_color: '#1e3a8a',
    alert_action_text: 'สนับสนุน',
    alert_action_color: '#60a5fa',
    alert_title_size: 26,
    alert_amount_bg: '#dbeafe',
    alert_amount_color: '#1d4ed8',
    alert_amount_border: '#93c5fd',
    alert_amount_size: 22,
    alert_msg_bg: 'rgba(255, 255, 255, 0.5)',
    alert_msg_color: '#1e293b',
    alert_msg_border: 'rgba(255, 255, 255, 0.6)',
    alert_msg_size: 18,
    alert_animation: 'zoom',
    alert_glow: 'false',
    alert_shadow_show: 'true'
  },
  pure_clear: {
    alert_theme: 'pure_clear',
    alert_font: 'LINESeedSansTH',
    alert_card_bg: 'transparent',
    alert_card_blur: 0,
    alert_card_width: 580,
    alert_border_color: 'rgba(255, 255, 255, 0.45)',
    alert_border_width: 1.5,
    alert_border_radius: 24,
    alert_shimmer_color: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
    alert_shimmer_show: 'true',
    alert_icon: 'star',
    alert_icon_bg: 'rgba(255, 255, 255, 0.15)',
    alert_icon_color: '#38bdf8',
    alert_icon_border: 'rgba(255, 255, 255, 0.3)',
    alert_name_color: '#ffffff',
    alert_action_text: 'เปย์กำลังใจ!',
    alert_action_color: '#94a3b8',
    alert_title_size: 26,
    alert_amount_bg: 'rgba(255, 255, 255, 0.15)',
    alert_amount_color: '#38bdf8',
    alert_amount_border: 'rgba(56, 189, 248, 0.5)',
    alert_amount_size: 24,
    alert_msg_bg: 'rgba(0, 0, 0, 0.25)',
    alert_msg_color: '#f8fafc',
    alert_msg_border: 'rgba(255, 255, 255, 0.2)',
    alert_msg_size: 18,
    alert_animation: 'bounce',
    alert_glow: 'true',
    alert_shadow_show: 'true'
  },
  dark_glass: {
    alert_theme: 'dark_glass',
    alert_font: 'Chakra Petch',
    alert_card_bg: 'rgba(15, 23, 42, 0.65)',
    alert_card_blur: 16,
    alert_card_width: 600,
    alert_border_color: '#06b6d4',
    alert_border_width: 2,
    alert_border_radius: 20,
    alert_shimmer_color: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
    alert_shimmer_show: 'true',
    alert_icon: 'fire',
    alert_icon_bg: 'rgba(15, 23, 42, 0.8)',
    alert_icon_color: '#38bdf8',
    alert_icon_border: '#06b6d4',
    alert_name_color: '#f8fafc',
    alert_action_text: 'ส่งพลังโดเนท!',
    alert_action_color: '#38bdf8',
    alert_title_size: 26,
    alert_amount_bg: 'rgba(30, 27, 75, 0.7)',
    alert_amount_color: '#38bdf8',
    alert_amount_border: '#06b6d4',
    alert_amount_size: 24,
    alert_msg_bg: 'rgba(15, 23, 42, 0.5)',
    alert_msg_color: '#e2e8f0',
    alert_msg_border: '#334155',
    alert_msg_size: 18,
    alert_animation: 'slide-down',
    alert_glow: 'true',
    alert_shadow_show: 'true'
  },
  emerald_cash: {
    alert_theme: 'emerald_cash',
    alert_font: 'LINESeedSansTH',
    alert_card_bg: '#f0fdf4',
    alert_card_blur: 0,
    alert_card_width: 580,
    alert_border_color: '#86efac',
    alert_border_width: 1.5,
    alert_border_radius: 24,
    alert_shimmer_color: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%)',
    alert_shimmer_show: 'true',
    alert_icon: 'coin',
    alert_icon_bg: '#dcfce7',
    alert_icon_color: '#059669',
    alert_icon_border: '#86efac',
    alert_name_color: '#065f46',
    alert_action_text: 'โดเนทให้',
    alert_action_color: '#059669',
    alert_title_size: 26,
    alert_amount_bg: '#dcfce7',
    alert_amount_color: '#065f46',
    alert_amount_border: '#86efac',
    alert_amount_size: 22,
    alert_msg_bg: '#ffffff',
    alert_msg_color: '#064e3b',
    alert_msg_border: '#bbf7d0',
    alert_msg_size: 18,
    alert_animation: 'slide-down',
    alert_glow: 'false',
    alert_shadow_show: 'true'
  }
};

export default function CustomizerPage() {
  const [settings, setSettings] = useState<AlertSettings>({
    alert_font: 'LINESeedSansTH',
    alert_card_bg: '#ffffff',
    alert_card_blur: 0,
    alert_card_width: 580,
    alert_border_color: '#e2e8f0',
    alert_border_width: 1.5,
    alert_border_radius: 24,
    alert_shadow_show: 'true',
    alert_glow: 'false',
    alert_shimmer_show: 'true',
    alert_shimmer_color: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #059669 100%)',
    alert_icon: 'gift',
    alert_icon_bg: '#f8fafc',
    alert_icon_color: '#0f172a',
    alert_icon_border: '#e2e8f0',
    alert_name_color: '#0f172a',
    alert_action_color: '#64748b',
    alert_action_text: 'โดเนทให้',
    alert_title_size: 26,
    alert_amount_bg: '#ecfdf5',
    alert_amount_color: '#059669',
    alert_amount_border: '#a7f3d0',
    alert_amount_size: 22,
    alert_msg_bg: '#f8fafc',
    alert_msg_color: '#334155',
    alert_msg_border: '#e2e8f0',
    alert_msg_size: 18,
    alert_animation: 'slide-down',
    alert_duration: 8
  });

  const [activePreset, setActivePreset] = useState<string>('modern_light');
  const [activeMode, setActiveMode] = useState<'frameless' | 'card'>('card');
  const [cardOpacity, setCardOpacity] = useState<number>(100);
  const [previewBg, setPreviewBg] = useState<'overlay' | 'checker' | 'game' | 'bright'>('overlay');
  const [mobileView, setMobileView] = useState<'controls' | 'preview'>('controls');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [obsUrl, setObsUrl] = useState<string>('http://localhost:3000/overlay');
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName?: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { }
    localStorage.removeItem('donate_admin_token');
    window.location.href = '/login';
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setObsUrl(`${window.location.origin}/overlay`);
    }

    // Check logged in user session
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => { });

    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.settings) {
          setSettings(prev => ({ ...prev, ...res.settings }));
          if (res.settings.alert_theme) {
            setActivePreset(res.settings.alert_theme);
            if (res.settings.alert_theme === 'frameless_clear') setActiveMode('frameless');
          }
        }
      })
      .catch(err => console.warn('Could not load settings:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const updateField = (key: keyof AlertSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    const p = PRESETS[presetKey];
    if (p) {
      setSettings(prev => ({ ...prev, ...p }));
      if (presetKey === 'frameless_clear') {
        setActiveMode('frameless');
        setCardOpacity(0);
      } else {
        setActiveMode('card');
        setCardOpacity(100);
      }
    }
  };

  const handleModeToggle = (mode: 'frameless' | 'card') => {
    setActiveMode(mode);
    if (mode === 'frameless') {
      applyPreset('frameless_clear');
    } else {
      applyPreset('modern_light');
    }
  };

  const handleOpacityPreset = (opacity: number, blur: number) => {
    setCardOpacity(opacity);
    updateField('alert_card_blur', blur);

    if (opacity === 0) {
      updateField('alert_card_bg', 'transparent');
    } else if (opacity === 100) {
      updateField('alert_card_bg', '#ffffff');
    } else {
      const alpha = (opacity / 100).toFixed(2);
      updateField('alert_card_bg', `rgba(255, 255, 255, ${alpha})`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const adminToken = localStorage.getItem('donate_admin_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['x-admin-token'] = adminToken;

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...settings, alert_theme: activePreset })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'บันทึกไม่สำเร็จ');
      }
      showToast('✓ บันทึกและซิงค์สไตล์ขึ้นจอ OBS สำเร็จแล้ว!');
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestRealObs = async () => {
    try {
      const adminToken = localStorage.getItem('donate_admin_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['x-admin-token'] = adminToken;

      const res = await fetch('/api/admin/test-alert', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'test',
          amount: 50,
          message: 'สวัสดีครับ'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('🚀 ส่ง Test Alert ไปที่จอ OBS Studio เรียบร้อยแล้ว!');
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการส่ง Test Alert');
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  const handleTriggerAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const handleResetDefault = () => {
    if (confirm('ต้องการคืนค่าเริ่มต้นทั้งหมดใช่หรือไม่?')) {
      applyPreset('modern_light');
      showToast('คืนค่าสไตล์เริ่มต้นแล้ว อย่าลืมกดบันทึกนะคะ');
    }
  };

  const handleCopyObsUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    showToast('คัดลอก URL เรียบร้อยแล้ว!');
  };

  const isCardFrameless = activeMode === 'frameless' || settings.alert_card_bg === 'transparent';
  const IconComponent = ICONS[settings.alert_icon || 'gift'] || ICONS.gift;

  return (
    <div className="admin-layout">
      {/* Reusable Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab="tabCustomizer"
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Reusable Mobile Top Bar */}
        <MobileTopBar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          title="OBS Alert Customizer"
          subtitle="สตูดิโอปรับแต่ง UI สตรีม"
          rightAction={
            <Link
              href="/overlay"
              target="_blank"
              className="btn sm"
              style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
            >
              เปิด Overlay ↗
            </Link>
          }
        />

        {/* Customizer Workspace Action Header */}
        <div style={{
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🎨</span>
              <h1 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                สตูดิโอปรับแต่ง UI แจ้งเตือน OBS (Customizer Studio)
              </h1>
              <span className="brand-badge" style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>
                Live Sync
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              ปรับแต่งสไตล์การแจ้งเตือนโดเนทขึ้นจอ OBS Studio ซิงค์แบบ Real-time ทันที
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn secondary sm"
              onClick={handleResetDefault}
              style={{ fontSize: '12.5px', padding: '8px 14px' }}
            >
              ↺ คืนค่าเริ่มต้น
            </button>
            <button
              type="button"
              className="btn secondary sm"
              onClick={handleTestRealObs}
              style={{ fontSize: '12.5px', padding: '8px 14px' }}
            >
              ทดสอบแจ้งเตือน
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={handleSave}
              disabled={isSaving}
              style={{ fontSize: '12.5px', padding: '8px 18px', fontWeight: 700 }}
            >
              {isSaving ? 'กำลังบันทึก...' : '💾 บันทึกและซิงค์ OBS'}
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="mobile-view-tabs">
          <button
            type="button"
            className={`mobile-view-btn ${mobileView === 'controls' ? 'active' : ''}`}
            onClick={() => setMobileView('controls')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>แผงปรับแต่ง</span>
          </button>
          <button
            type="button"
            className={`mobile-view-btn ${mobileView === 'preview' ? 'active' : ''}`}
            onClick={() => setMobileView('preview')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>ดูพรีวิวบนจอ OBS</span>
          </button>
        </div>

        {/* Floating View Toggle Button on Mobile */}
        <button
          type="button"
          className="floating-view-toggle"
          onClick={() => setMobileView(mobileView === 'controls' ? 'preview' : 'controls')}
        >
          <span>{mobileView === 'controls' ? '👁️' : '⚙️'}</span>
          <span>{mobileView === 'controls' ? 'ดูพรีวิวสด' : 'แก้ไขดีไซน์'}</span>
        </button>

        {/* Main Customizer Workspace */}
        <div className="customizer-container" data-mobile-view={mobileView}>
          {/* Left Column: Controls */}
          <div className="controls-panel">
            {/* Quick Mode Switcher Banner */}
            <div className="quick-mode-banner">
              <div className="mode-info">
                <div className="mode-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <div className="mode-text-wrap">
                  <div className="mode-title">สลับรูปแบบการแจ้งเตือนด่วน</div>
                  <div className="mode-sub">เลือกระหว่าง "แบบการ์ดปกติ" หรือ "แบบลอยโปร่งใส ไร้กรอบ ไร้พื้นหลัง"</div>
                </div>
              </div>
              <div className="mode-buttons">
                <button
                  type="button"
                  className={`btn-mode-toggle ${activeMode === 'frameless' ? 'active-frameless' : ''}`}
                  onClick={() => handleModeToggle('frameless')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>ไร้กรอบ ไร้พื้นหลัง ทั้งหมด (All Frameless)</span>
                </button>
                <button
                  type="button"
                  className={`btn-mode-toggle ${activeMode === 'card' ? 'active' : ''}`}
                  onClick={() => handleModeToggle('card')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                  <span>มีกรอบและการ์ดปกติ (Card Mode)</span>
                </button>
              </div>
            </div>

            {/* Preset Themes */}
            <div className="panel-section">
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                ธีมสำเร็จรูป (1-Click Presets)
              </div>
              <p className="section-desc">คลิกเลือกธีมสำเร็จรูปเพื่อนำไปปรับแต่งต่อได้อย่างรวดเร็ว</p>
              <div className="presets-grid">
                <button
                  type="button"
                  className={`preset-card ${activePreset === 'frameless_clear' ? 'active' : ''}`}
                  onClick={() => applyPreset('frameless_clear')}
                >
                  <div className="preset-preview preview-checker" style={{ border: '1.5px dashed #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', background: 'rgba(255,255,255,0.85)', padding: '2px 6px', borderRadius: '4px' }}>
                      ไร้กรอบ & ไร้พื้นหลัง
                    </span>
                  </div>
                  <span>✨ ไร้กรอบ ลอยโปร่งใส</span>
                </button>

                <button
                  type="button"
                  className={`preset-card ${activePreset === 'modern_light' ? 'active' : ''}`}
                  onClick={() => applyPreset('modern_light')}
                >
                  <div className="preset-preview" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #0f172a, #2563eb, #059669)', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ padding: '6px', fontSize: '11px', color: '#0f172a', fontWeight: 'bold' }}>Modern Light</div>
                  </div>
                  <span>มินิมอลขาวสว่าง</span>
                </button>

                <button
                  type="button"
                  className={`preset-card ${activePreset === 'dark_luxury' ? 'active' : ''}`}
                  onClick={() => applyPreset('dark_luxury')}
                >
                  <div className="preset-preview" style={{ background: '#0f172a', border: '1.5px solid #334155' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #d97706)', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ padding: '6px', fontSize: '11px', color: '#f8fafc', fontWeight: 'bold' }}>Dark Luxury</div>
                  </div>
                  <span>ดาร์กโหมดหรูหรา</span>
                </button>

                <button
                  type="button"
                  className={`preset-card ${activePreset === 'cyber_neon' ? 'active' : ''}`}
                  onClick={() => applyPreset('cyber_neon')}
                >
                  <div className="preset-preview" style={{ background: '#090d16', border: '1.5px solid #06b6d4', boxShadow: '0 0 10px rgba(6,182,212,0.4)' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4)', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ padding: '6px', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>Cyber Neon</div>
                  </div>
                  <span>เกมมิ่งนีออน</span>
                </button>

                <button
                  type="button"
                  className={`preset-card ${activePreset === 'sweet_pastel' ? 'active' : ''}`}
                  onClick={() => applyPreset('sweet_pastel')}
                >
                  <div className="preset-preview" style={{ background: '#fff5f7', border: '1.5px solid #fecdd3' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #f43f5e, #fb7185, #fda4af)', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ padding: '6px', fontSize: '11px', color: '#e11d48', fontWeight: 'bold' }}>Sweet Pastel</div>
                  </div>
                  <span>พาสเทลหวานละมุน</span>
                </button>

                <button
                  type="button"
                  className={`preset-card ${activePreset === 'glass_frost' ? 'active' : ''}`}
                  onClick={() => applyPreset('glass_frost')}
                >
                  <div className="preset-preview" style={{ background: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ padding: '6px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold' }}>Glass Frost</div>
                  </div>
                  <span>กระจกฝ้าโปร่งแสง</span>
                </button>

                <button
                  type="button"
                  className={`preset-card ${activePreset === 'pure_clear' ? 'active' : ''}`}
                  onClick={() => applyPreset('pure_clear')}
                >
                  <div className="preset-preview preview-checker" style={{ border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 0 10px rgba(56,189,248,0.4)' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ padding: '6px', fontSize: '11px', color: '#0284c7', fontWeight: 'bold', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }}>Pure Clear</div>
                  </div>
                  <span>✨ โปร่งใสทะลุจอ</span>
                </button>

                <button
                  type="button"
                  className={`preset-card ${activePreset === 'dark_glass' ? 'active' : ''}`}
                  onClick={() => applyPreset('dark_glass')}
                >
                  <div className="preset-preview" style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1.5px solid #06b6d4', backdropFilter: 'blur(10px)' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #6366f1)', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ padding: '6px', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>Dark Glass</div>
                  </div>
                  <span>💎 กระจกดำนีออน</span>
                </button>

                <button
                  type="button"
                  className={`preset-card ${activePreset === 'emerald_cash' ? 'active' : ''}`}
                  onClick={() => applyPreset('emerald_cash')}
                >
                  <div className="preset-preview" style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}>
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #059669, #10b981, #34d399)', borderRadius: '4px 4px 0 0' }}></div>
                    <div style={{ padding: '6px', fontSize: '11px', color: '#065f46', fontWeight: 'bold' }}>Emerald Cash</div>
                  </div>
                  <span>เขียวมรกตสดชื่น</span>
                </button>
              </div>
            </div>

            {/* Section: Card Shape & Structure */}
            <div className="panel-section">
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                การ์ดและโครงสร้าง (Card Layout)
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span>ความกว้างการ์ด ({settings.alert_card_width || 580}px)</span>
                  </label>
                  <input
                    type="range"
                    min="400"
                    max="750"
                    step="10"
                    value={settings.alert_card_width || 580}
                    onChange={(e) => updateField('alert_card_width', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span>ความมนขอบ ({settings.alert_border_radius ?? 24}px)</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    value={settings.alert_border_radius ?? 24}
                    onChange={(e) => updateField('alert_border_radius', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span>ความหนาเส้นขอบ ({settings.alert_border_width ?? 1.5}px)</span>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => updateField('alert_border_width', 0)}
                    >
                      🚫 ไม่เอาเส้นขอบ (0px)
                    </button>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={settings.alert_border_width ?? 1.5}
                    onChange={(e) => updateField('alert_border_width', parseFloat(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">เงาการ์ดและแสงเรือง (Shadow & Glow)</label>
                  <select
                    className="input-control"
                    value={
                      settings.alert_shadow_show === 'false'
                        ? 'none'
                        : settings.alert_glow === 'true'
                          ? 'true'
                          : 'false'
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === 'none') {
                        updateField('alert_shadow_show', 'false');
                        updateField('alert_glow', 'false');
                      } else if (v === 'true') {
                        updateField('alert_shadow_show', 'true');
                        updateField('alert_glow', 'true');
                      } else {
                        updateField('alert_shadow_show', 'true');
                        updateField('alert_glow', 'false');
                      }
                    }}
                  >
                    <option value="false">เงาการ์ดมาตรฐาน</option>
                    <option value="true">แสงนีออนเรืองแสงรอบการ์ด (Neon Glow)</option>
                    <option value="none">🚫 ไม่เอาเงา (ปิดเงากล่อง)</option>
                  </select>
                </div>
              </div>

              <div className="color-picker-grid">
                <div className="color-field">
                  <div className="field-label-row">
                    <label>สีพื้นหลังการ์ด</label>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => {
                        updateField('alert_card_bg', 'transparent');
                        setCardOpacity(0);
                      }}
                    >
                      🚫 ไม่เอาพื้นหลัง
                    </button>
                  </div>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_card_bg?.startsWith('#') ? settings.alert_card_bg : '#ffffff'}
                      onChange={(e) => updateField('alert_card_bg', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_card_bg || '#ffffff'}
                      onChange={(e) => updateField('alert_card_bg', e.target.value)}
                    />
                  </div>
                </div>
                <div className="color-field">
                  <div className="field-label-row">
                    <label>สีเส้นขอบการ์ด</label>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => updateField('alert_border_color', 'transparent')}
                    >
                      🚫 ขอบใส
                    </button>
                  </div>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_border_color?.startsWith('#') ? settings.alert_border_color : '#e2e8f0'}
                      onChange={(e) => updateField('alert_border_color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_border_color || '#e2e8f0'}
                      onChange={(e) => updateField('alert_border_color', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Card Background Transparency & Blur Controls */}
              <div className="transparency-control-box">
                <div className="form-row" style={{ marginBottom: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">
                      <span>ความโปร่งใสพื้นหลัง ({cardOpacity}%)</span>
                      <span className="label-hint">{cardOpacity === 100 ? 'ทึบแสง' : cardOpacity === 0 ? 'โปร่งใส 100%' : 'กึ่งโปร่ง'}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={cardOpacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCardOpacity(val);
                        if (val === 0) {
                          updateField('alert_card_bg', 'transparent');
                        } else if (val === 100) {
                          updateField('alert_card_bg', '#ffffff');
                        } else {
                          updateField('alert_card_bg', `rgba(255, 255, 255, ${(val / 100).toFixed(2)})`);
                        }
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <span>กระจกฝ้าฉากหลัง ({settings.alert_card_blur || 0}px)</span>
                      <span className="label-hint">ความเบลอ OBS</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={settings.alert_card_blur || 0}
                      onChange={(e) => updateField('alert_card_blur', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {/* Quick Opacity Presets */}
                <div className="quick-opacity-row">
                  <div className="quick-op-title">ความโปร่งใสด่วน:</div>
                  <div className="quick-op-group">
                    <button
                      type="button"
                      className={`btn-quick-op ${cardOpacity === 0 ? 'active' : ''}`}
                      onClick={() => handleOpacityPreset(0, 0)}
                    >
                      <span>✨ โปร่งใส 100%</span>
                    </button>
                    <button
                      type="button"
                      className={`btn-quick-op ${cardOpacity === 40 ? 'active' : ''}`}
                      onClick={() => handleOpacityPreset(40, 12)}
                    >
                      <span>🌫️ กึ่งโปร่ง 40%</span>
                    </button>
                    <button
                      type="button"
                      className={`btn-quick-op ${cardOpacity === 75 ? 'active' : ''}`}
                      onClick={() => handleOpacityPreset(75, 16)}
                    >
                      <span>💎 กระจกฝ้า 75%</span>
                    </button>
                    <button
                      type="button"
                      className={`btn-quick-op ${cardOpacity === 100 ? 'active' : ''}`}
                      onClick={() => handleOpacityPreset(100, 0)}
                    >
                      <span>⬛ ทึบแสง 100%</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Icon & Header */}
            <div className="panel-section">
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"></polyline>
                  <rect x="2" y="7" width="20" height="5"></rect>
                  <line x1="12" y1="22" x2="12" y2="7"></line>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                </svg>
                ไอคอน & แถบสีด้านบน (Accent & Icon)
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">เลือกรูปไอคอน</label>
                  <select
                    className="input-control"
                    value={settings.alert_icon || 'gift'}
                    onChange={(e) => updateField('alert_icon', e.target.value)}
                  >
                    <option value="gift">🎁 กล่องของขวัญ (Gift Box)</option>
                    <option value="heart">❤️ หัวใจแห่งความรัก (Heart)</option>
                    <option value="coin">🪙 เหรียญทองคำ (Coin)</option>
                    <option value="star">⭐ ดาวประกาย (Star)</option>
                    <option value="fire">🔥 เปลวไฟลุก (Fire)</option>
                    <option value="trophy">🏆 ถ้วยรางวัล (Trophy)</option>
                  </select>
                </div>
                <div className="form-group">
                  <div className="field-label-row">
                    <label className="form-label" style={{ marginBottom: 0 }}>ข้อความบอกการกระทำ (Action Text)</label>
                    <span className="label-hint">เช่น โดเนทให้, สนับสนุน</span>
                  </div>
                  <input
                    type="text"
                    className="input-control"
                    value={settings.alert_action_text || 'โดเนทให้'}
                    onChange={(e) => updateField('alert_action_text', e.target.value)}
                    placeholder="เช่น โดเนทให้ / สนับสนุน / เลี้ยงกาแฟ"
                  />
                  <div className="action-text-chips" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {['โดเนทให้', 'สนับสนุน', 'เลี้ยงกาแฟ', 'ส่งกำลังใจ', 'เปย์ให้'].map((txt) => (
                      <button
                        key={txt}
                        type="button"
                        className="btn-action-chip"
                        onClick={() => updateField('alert_action_text', txt)}
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                    💡 รูปแบบบนจอ: <strong style={{ color: 'var(--text-main)' }}>[ชื่อ] [ข้อความ] [จำนวน] บาท</strong>
                  </div>
                </div>
              </div>

              <div className="form-row" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">แถบสีด้านบน (Shimmer Bar)</label>
                  <select
                    className="input-control"
                    value={String(settings.alert_shimmer_show !== 'false')}
                    onChange={(e) => updateField('alert_shimmer_show', e.target.value)}
                  >
                    <option value="true">🌈 แสดงแถบสีด้านบน</option>
                    <option value="false">🚫 ไม่เอาแถบสีด้านบน (ซ่อนแถบสี)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span>กล่องพื้นหลังไอคอน</span>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => {
                        updateField('alert_icon_bg', 'transparent');
                        updateField('alert_icon_border', 'transparent');
                      }}
                    >
                      🚫 ไม่เอากล่อง
                    </button>
                  </label>
                  <select
                    className="input-control"
                    value={settings.alert_icon_bg === 'transparent' ? 'none' : 'box'}
                    onChange={(e) => {
                      if (e.target.value === 'none') {
                        updateField('alert_icon_bg', 'transparent');
                        updateField('alert_icon_border', 'transparent');
                      } else {
                        updateField('alert_icon_bg', '#f8fafc');
                        updateField('alert_icon_border', '#e2e8f0');
                      }
                    }}
                  >
                    <option value="box">มีกล่องพื้นหลังไอคอน</option>
                    <option value="none">🚫 ไม่เอาพื้นหลัง (ลอยเฉพาะรูปไอคอน)</option>
                  </select>
                </div>
              </div>

              <div className="color-picker-grid">
                <div className="color-field">
                  <label>สีไอคอน</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_icon_color?.startsWith('#') ? settings.alert_icon_color : '#0f172a'}
                      onChange={(e) => updateField('alert_icon_color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_icon_color || '#0f172a'}
                      onChange={(e) => updateField('alert_icon_color', e.target.value)}
                    />
                  </div>
                </div>
                <div className="color-field">
                  <div className="field-label-row">
                    <label>สีพื้นหลังกล่องไอคอน</label>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => updateField('alert_icon_bg', 'transparent')}
                    >
                      🚫 ใส
                    </button>
                  </div>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_icon_bg?.startsWith('#') ? settings.alert_icon_bg : '#f8fafc'}
                      onChange={(e) => updateField('alert_icon_bg', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_icon_bg || '#f8fafc'}
                      onChange={(e) => updateField('alert_icon_bg', e.target.value)}
                    />
                  </div>
                </div>
                <div className="color-field full-width">
                  <label>แถบสีสตรีคด้านบน (Shimmer Bar Gradient / Color)</label>
                  <input
                    type="text"
                    className="input-control"
                    value={settings.alert_shimmer_color || 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #059669 100%)'}
                    onChange={(e) => updateField('alert_shimmer_color', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section: Typography & Colors */}
            <div className="panel-section">
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 7 4 4 20 4 20 7"></polyline>
                  <line x1="9" y1="20" x2="15" y2="20"></line>
                  <line x1="12" y1="4" x2="12" y2="20"></line>
                </svg>
                ฟอนต์ & สีตัวอักษร (Typography)
              </div>

              <div className="form-group">
                <label className="form-label">ฟอนต์ตัวอักษร (Font Family)</label>
                <select
                  className="input-control"
                  value={settings.alert_font || 'LINESeedSansTH'}
                  onChange={(e) => updateField('alert_font', e.target.value)}
                >
                  <option value="LINESeedSansTH">LINE Seed Sans TH (แนะนำ)</option>
                  <option value="Kanit">Kanit (สไตล์ยอดนิยม กึ่งทางการ)</option>
                  <option value="Prompt">Prompt (โมเดิร์น คมชัด อ่านง่าย)</option>
                  <option value="Chakra Petch">Chakra Petch (เกมมิ่ง สไตล์ Cyber / Sci-Fi)</option>
                  <option value="Mitr">Mitr (กลม มน สบายตา)</option>
                  <option value="Sarabun">Sarabun (ทางการ สะอาด เรียบง่าย)</option>
                  <option value="Outfit">Outfit / Inter (อินเตอร์ คลาสสิก)</option>
                </select>
              </div>

              <div className="color-picker-grid">
                <div className="color-field">
                  <label>สีชื่อผู้สนับสนุน</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_name_color?.startsWith('#') ? settings.alert_name_color : '#0f172a'}
                      onChange={(e) => updateField('alert_name_color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_name_color || '#0f172a'}
                      onChange={(e) => updateField('alert_name_color', e.target.value)}
                    />
                  </div>
                </div>
                <div className="color-field">
                  <label>สีข้อความต่อท้ายชื่อ</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_action_color?.startsWith('#') ? settings.alert_action_color : '#64748b'}
                      onChange={(e) => updateField('alert_action_color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_action_color || '#64748b'}
                      onChange={(e) => updateField('alert_action_color', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label className="form-label">ขนาดตัวอักษรชื่อ ({settings.alert_title_size || 26}px)</label>
                <input
                  type="range"
                  min="20"
                  max="36"
                  value={settings.alert_title_size || 26}
                  onChange={(e) => updateField('alert_title_size', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Section: Amount & Message Styling */}
            <div className="panel-section">
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                ป้ายยอดเงิน & กล่องข้อความ (Amount & Message)
              </div>

              <div className="form-row" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span>ป้ายพื้นหลังยอดเงิน</span>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => {
                        updateField('alert_amount_bg', 'transparent');
                        updateField('alert_amount_border', 'transparent');
                      }}
                    >
                      🚫 ไม่เอาป้าย (ลอยเฉพาะตัวเลข)
                    </button>
                  </label>
                  <select
                    className="input-control"
                    value={settings.alert_amount_bg === 'transparent' ? 'none' : 'pill'}
                    onChange={(e) => {
                      if (e.target.value === 'none') {
                        updateField('alert_amount_bg', 'transparent');
                        updateField('alert_amount_border', 'transparent');
                      } else {
                        updateField('alert_amount_bg', '#ecfdf5');
                        updateField('alert_amount_border', '#a7f3d0');
                      }
                    }}
                  >
                    <option value="pill">มีป้ายพื้นหลังยอดเงิน (Pill Badge)</option>
                    <option value="none">🚫 ไม่เอาพื้นหลังป้าย (ลอยเฉพาะตัวเลข)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span>พื้นหลังกล่องข้อความ</span>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => {
                        updateField('alert_msg_bg', 'transparent');
                        updateField('alert_msg_border', 'transparent');
                      }}
                    >
                      🚫 ไม่เอากล่อง (ลอยเฉพาะข้อความ)
                    </button>
                  </label>
                  <select
                    className="input-control"
                    value={settings.alert_msg_bg === 'transparent' ? 'none' : 'box'}
                    onChange={(e) => {
                      if (e.target.value === 'none') {
                        updateField('alert_msg_bg', 'transparent');
                        updateField('alert_msg_border', 'transparent');
                      } else {
                        updateField('alert_msg_bg', '#f8fafc');
                        updateField('alert_msg_border', '#e2e8f0');
                      }
                    }}
                  >
                    <option value="box">มีกล่องพื้นหลังข้อความ</option>
                    <option value="none">🚫 ไม่เอาพื้นหลังกล่อง (ลอยเฉพาะข้อความ)</option>
                  </select>
                </div>
              </div>

              <div className="color-picker-grid">
                <div className="color-field">
                  <div className="field-label-row">
                    <label>สีพื้นหลังป้ายยอดเงิน</label>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => updateField('alert_amount_bg', 'transparent')}
                    >
                      🚫 ใส
                    </button>
                  </div>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_amount_bg?.startsWith('#') ? settings.alert_amount_bg : '#ecfdf5'}
                      onChange={(e) => updateField('alert_amount_bg', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_amount_bg || '#ecfdf5'}
                      onChange={(e) => updateField('alert_amount_bg', e.target.value)}
                    />
                  </div>
                </div>
                <div className="color-field">
                  <label>สีตัวเลขยอดเงิน</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_amount_color?.startsWith('#') ? settings.alert_amount_color : '#059669'}
                      onChange={(e) => updateField('alert_amount_color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_amount_color || '#059669'}
                      onChange={(e) => updateField('alert_amount_color', e.target.value)}
                    />
                  </div>
                </div>
                <div className="color-field">
                  <div className="field-label-row">
                    <label>สีพื้นหลังกล่องข้อความ</label>
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={() => updateField('alert_msg_bg', 'transparent')}
                    >
                      🚫 ใส
                    </button>
                  </div>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_msg_bg?.startsWith('#') ? settings.alert_msg_bg : '#f8fafc'}
                      onChange={(e) => updateField('alert_msg_bg', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_msg_bg || '#f8fafc'}
                      onChange={(e) => updateField('alert_msg_bg', e.target.value)}
                    />
                  </div>
                </div>
                <div className="color-field">
                  <label>สีตัวหนังสือข้อความ</label>
                  <div className="color-input-wrap">
                    <input
                      type="color"
                      value={settings.alert_msg_color?.startsWith('#') ? settings.alert_msg_color : '#334155'}
                      onChange={(e) => updateField('alert_msg_color', e.target.value)}
                    />
                    <input
                      type="text"
                      className="hex-input"
                      value={settings.alert_msg_color || '#334155'}
                      onChange={(e) => updateField('alert_msg_color', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="quick-msg-transparency" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ปรับพื้นหลังข้อความด่วน:</span>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}
                  onClick={() => {
                    updateField('alert_msg_bg', 'rgba(255, 255, 255, 0.4)');
                    updateField('alert_msg_border', 'rgba(255, 255, 255, 0.6)');
                  }}
                >
                  💎 กระจกฝ้ากึ่งโปร่ง
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}
                  onClick={() => {
                    updateField('alert_msg_bg', '#f8fafc');
                    updateField('alert_msg_border', '#e2e8f0');
                  }}
                >
                  ⬛ คืนค่าสีพื้นเดิม
                </button>
              </div>

              <div className="form-row" style={{ marginTop: '14px' }}>
                <div className="form-group">
                  <label className="form-label">ขนาดยอดเงิน ({settings.alert_amount_size || 22}px)</label>
                  <input
                    type="range"
                    min="18"
                    max="32"
                    value={settings.alert_amount_size || 22}
                    onChange={(e) => updateField('alert_amount_size', parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ขนาดข้อความ ({settings.alert_msg_size || 18}px)</label>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    value={settings.alert_msg_size || 18}
                    onChange={(e) => updateField('alert_msg_size', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Section: Animation & Sound */}
            <div className="panel-section">
              <div className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                อนิเมชั่นและเวลาแสดงผล (Animation & Timing)
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">รูปแบบอนิเมชั่นเข้า-ออก</label>
                  <select
                    className="input-control"
                    value={settings.alert_animation || 'slide-down'}
                    onChange={(e) => updateField('alert_animation', e.target.value)}
                  >
                    <option value="slide-down">Slide Down (เลื่อนลงมาจากด้านบน)</option>
                    <option value="bounce">Bounce Pop (เด้งดึ๋ง สดใส มีพลัง)</option>
                    <option value="zoom">Zoom Fade (ซูมขยาย คมชัด)</option>
                    <option value="slide-left">Slide Left (เลื่อนจากซ้ายไปขวา)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span>ระยะเวลาแสดงผล ({settings.alert_duration || 8} วินาที)</span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="25"
                    value={settings.alert_duration || 8}
                    onChange={(e) => updateField('alert_duration', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="action-bar-bottom">
              <button
                type="button"
                className="btn btn-save-big"
                onClick={handleSave}
                disabled={isSaving}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกและส่งขึ้น OBS ทันที'}</span>
              </button>

              <button
                type="button"
                className="btn secondary"
                onClick={handleResetDefault}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                คืนค่าเริ่มต้น
              </button>
            </div>
          </div>

          {/* Right Column: Sticky Live Preview Simulator */}
          <div className="preview-panel">
            <div className="preview-header">
              <div className="preview-title">
                <span className="pulse-dot"></span>
                <span>หน้าต่างจำลอง OBS Overlay (Live Preview)</span>
              </div>
              <div className="preview-bg-switch">
                <button
                  type="button"
                  className={`bg-btn ${previewBg === 'overlay' ? 'active' : ''}`}
                  onClick={() => setPreviewBg('overlay')}
                >
                  พื้นหลังจริง
                </button>
                <button
                  type="button"
                  className={`bg-btn ${previewBg === 'checker' ? 'active' : ''}`}
                  onClick={() => setPreviewBg('checker')}
                >
                  ตารางโปร่งใส
                </button>
                <button
                  type="button"
                  className={`bg-btn ${previewBg === 'game' ? 'active' : ''}`}
                  onClick={() => setPreviewBg('game')}
                >
                  เกมมืด
                </button>
                <button
                  type="button"
                  className={`bg-btn ${previewBg === 'bright' ? 'active' : ''}`}
                  onClick={() => setPreviewBg('bright')}
                >
                  ห้องสว่าง
                </button>
              </div>
            </div>

            {/* Simulator Stage Area */}
            <div className={`preview-stage bg-${previewBg}`}>
              {/* The Live Alert Element */}
              <div
                className={`alert-wrapper anim-${settings.alert_animation || 'slide-down'} ${isAnimating ? 'hide' : 'show'}`}
                style={{
                  width: `${settings.alert_card_width || 580}px`,
                  fontFamily: `'${settings.alert_font || 'LINESeedSansTH'}', sans-serif`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  className="alert-card"
                  style={{
                    background: settings.alert_card_bg || '#ffffff',
                    backdropFilter: settings.alert_card_blur ? `blur(${settings.alert_card_blur}px)` : 'none',
                    WebkitBackdropFilter: settings.alert_card_blur ? `blur(${settings.alert_card_blur}px)` : 'none',
                    border: `${settings.alert_border_width ?? 1.5}px solid ${settings.alert_border_color || '#e2e8f0'}`,
                    borderRadius: `${settings.alert_border_radius ?? 24}px`,
                    boxShadow:
                      settings.alert_shadow_show === 'false'
                        ? 'none'
                        : settings.alert_glow === 'true'
                          ? `0 25px 50px -12px rgba(0,0,0,0.3), 0 0 35px ${settings.alert_border_color || '#2563eb'}66`
                          : '0 25px 50px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  {settings.alert_shimmer_show !== 'false' && (
                    <div
                      className="alert-shimmer"
                      style={{ background: settings.alert_shimmer_color || 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #059669 100%)' }}
                    />
                  )}

                  <div
                    className="alert-icon-wrap"
                    style={{
                      background: settings.alert_icon_bg || '#f8fafc',
                      color: settings.alert_icon_color || '#0f172a',
                      border: settings.alert_icon_bg === 'transparent' ? 'none' : `1.5px solid ${settings.alert_icon_border || '#e2e8f0'}`,
                      boxShadow: settings.alert_icon_bg === 'transparent' ? 'none' : '0 4px 12px rgba(15, 23, 42, 0.05)'
                    }}
                  >
                    {IconComponent}
                  </div>

                  <div
                    className="alert-title alert-headline"
                    style={{ fontSize: `${settings.alert_title_size || 26}px` }}
                  >
                    <span className="donator-name" style={{ color: settings.alert_name_color || '#0f172a' }}>
                      test
                    </span>
                    <span className="alert-action-text" style={{ color: settings.alert_action_color || '#64748b' }}>
                      {settings.alert_action_text || 'โดเนทให้'}
                    </span>
                    <span
                      className="alert-amount-wrap"
                      style={{
                        background: settings.alert_amount_bg || '#ecfdf5',
                        color: settings.alert_amount_color || '#059669',
                        border: settings.alert_amount_bg === 'transparent' ? 'none' : `1.5px solid ${settings.alert_amount_border || '#a7f3d0'}`,
                        fontSize: `${settings.alert_amount_size || 22}px`,
                        boxShadow: 'none',
                        padding: settings.alert_amount_bg === 'transparent' ? '0' : '2px 14px'
                      }}
                    >
                      <span className="alert-amount-val">50</span>
                      <span className="alert-currency">บาท</span>
                    </span>
                  </div>

                  <div
                    className="alert-message"
                    style={{
                      background: settings.alert_msg_bg || '#f8fafc',
                      color: settings.alert_msg_color || '#334155',
                      fontSize: `${settings.alert_msg_size || 18}px`,
                      border: settings.alert_msg_bg === 'transparent' ? 'none' : `1px solid ${settings.alert_msg_border || '#e2e8f0'}`,
                      padding: settings.alert_msg_bg === 'transparent' ? '4px 0' : '12px 18px'
                    }}
                  >
                    สวัสดีครับ
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Interactive Controls */}
            <div className="preview-controls-box">
              <button
                type="button"
                className="btn-action-preview"
                onClick={handleTriggerAnimation}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                ทดสอบเล่นอนิเมชั่นพรีวิว
              </button>

              <button
                type="button"
                className="btn-action-obs"
                onClick={handleTestRealObs}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                ทดสอบแจ้งเตือน Overlay
              </button>
            </div>

            <div className="obs-url-card">
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                🔗 ลิงก์ Browser Source สำหรับใส่ใน OBS Studio:
              </div>
              <div className="url-copy-box">
                <code>{obsUrl}</code>
                <button type="button" className="btn secondary sm" onClick={handleCopyObsUrl}>
                  คัดลอก
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>
                * เมื่อกดบันทึก หน้าจอ OBS Studio จะเปลี่ยนตามสไตล์ที่คุณตั้งค่าทันทีแบบ Real-time โดยไม่ต้องกด Refresh Browser ใน OBS!
              </p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <div className={`toast ${toastMessage ? 'show success' : ''}`}>
          {toastMessage}
        </div>
      </div>
    </div>
  );
}
