'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  Check,
  Sliders,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { supabase } from '@/lib/supabaseClient';
import {
  computeRemainingSeconds,
  formatDeltaDisplay,
  formatTimerDisplay
} from '@/lib/timerLogic';
import {
  defaultTimerAppearance,
  defaultTimerConfig,
  TimerAction,
  TimerAppearance,
  TimerConfig,
  TimerEventPayload,
  TimerRule,
  TimerStatus,
  TimerTheme
} from '@/lib/timerTypes';
import './timer-admin.css';

export default function TimerAdminPage() {
  const { showToast, handleUnauthorized } = useAdmin();

  const [config, setConfig] = useState<TimerConfig>(defaultTimerConfig);
  const [liveSeconds, setLiveSeconds] = useState<number>(3600);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('');
  const [previewKey, setPreviewKey] = useState<number>(0);

  // New tier rule form state
  const [newRuleAmount, setNewRuleAmount] = useState<string>('50');
  const [newRuleAction, setNewRuleAction] = useState<TimerAction>('subtract');
  const [newRuleMinutes, setNewRuleMinutes] = useState<string>('10');
  const [newRuleLabel, setNewRuleLabel] = useState<string>('');

  // Simulation test state
  const [simAmount, setSimAmount] = useState<string>('5');
  const [simDonor, setSimDonor] = useState<string>('ผู้ชมใจดี');
  const [simulating, setSimulating] = useState<boolean>(false);

  // Ref for timer loop
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Set window origin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Fetch initial config
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/timer');
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        const current = computeRemainingSeconds(data.config);
        setLiveSeconds(current);
      } else {
        showToast(data.message || 'ไม่สามารถโหลดข้อมูลตัวจับเวลาได้');
      }
    } catch (err: any) {
      console.error('Fetch timer config error:', err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, showToast]);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  // Realtime subscription for timer updates
  useEffect(() => {
    const channel = supabase.channel('donation-alerts');

    channel
      .on('broadcast', { event: 'timer_update' }, (payload: any) => {
        const data = payload.payload as TimerEventPayload;
        if (!data) return;

        setConfig(prev => {
          const updated = {
            ...prev,
            timer_status: data.status || prev.timer_status,
            timer_remaining_seconds: typeof data.remaining_seconds === 'number' ? data.remaining_seconds : prev.timer_remaining_seconds,
            timer_last_updated_at: data.last_updated_at || prev.timer_last_updated_at
          };
          return updated;
        });

        if (typeof data.remaining_seconds === 'number') {
          setLiveSeconds(data.remaining_seconds);
        }

        if (data.delta_seconds) {
          const msg = data.donor_name
            ? `⏱️ ${data.donor_name}: ${formatDeltaDisplay(data.delta_seconds)} (${data.reason || ''})`
            : `⏱️ ปรับเวลา ${formatDeltaDisplay(data.delta_seconds)}`;
          showToast(msg);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showToast]);

  // Live countdown loop
  useEffect(() => {
    const interval = setInterval(() => {
      const cur = configRef.current;
      const computed = computeRemainingSeconds({
        timer_status: cur.timer_status,
        timer_remaining_seconds: cur.timer_remaining_seconds,
        timer_last_updated_at: cur.timer_last_updated_at,
        timer_max_cap_seconds: cur.timer_max_cap_seconds
      });
      setLiveSeconds(computed);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Timer Command Action (Start, Pause, Resume, Reset, Stop)
  const handleCommand = async (command: 'start' | 'pause' | 'resume' | 'reset' | 'stop') => {
    try {
      const res = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setLiveSeconds(data.liveRemaining);
        const actionLabels: Record<string, string> = {
          start: 'เริ่มนับเวลาแล้ว',
          resume: 'นับเวลาต่อแล้ว',
          pause: 'หยุดเวลาชั่วคราวแล้ว',
          reset: 'รีเซ็ตเวลากลับค่าเริ่มต้นแล้ว',
          stop: 'หยุดการจับเวลาแล้ว'
        };
        showToast(actionLabels[command] || 'ดำเนินการสำเร็จ');
      } else {
        showToast(data.message || 'ดำเนินการไม่สำเร็จ');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการส่งคำสั่ง');
    }
  };

  // Quick Adjust (e.g. +300s, -300s)
  const handleQuickAdjust = async (deltaSeconds: number) => {
    try {
      const res = await fetch('/api/admin/timer/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deltaSeconds })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
      } else {
        showToast(data.message || 'ปรับเวลาไม่สำเร็จ');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการปรับเวลา');
    }
  };

  // Simulate donation test
  const handleSimulate = async () => {
    const amt = parseFloat(simAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('กรุณาระบุยอดเงินจำลองที่ถูกต้อง');
      return;
    }
    setSimulating(true);
    try {
      const res = await fetch('/api/admin/timer/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulate: true,
          amount: amt,
          name: simDonor.trim() || 'ผู้ชมทดสอบ'
        })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 ${data.message}`);
        setPreviewKey(k => k + 1);
      } else {
        showToast(data.message || 'การจำลองล้มเหลว');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการจำลอง');
    } finally {
      setSimulating(false);
    }
  };

  // Save Config Settings
  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        showToast('บันทึกการตั้งค่าระบบจับเวลาเรียบร้อยแล้ว');
        setPreviewKey(k => k + 1);
      } else {
        showToast(data.message || 'บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  // Add custom tier rule
  const handleAddTierRule = () => {
    const amt = parseFloat(newRuleAmount);
    const mins = parseFloat(newRuleMinutes);
    if (isNaN(amt) || amt <= 0 || isNaN(mins) || mins <= 0) {
      showToast('กรุณากรอกยอดเงินและจำนวนนาทีที่ถูกต้อง');
      return;
    }
    const newRule: TimerRule = {
      id: 'rule-' + Date.now(),
      amount: amt,
      action: newRuleAction,
      seconds: Math.round(mins * 60),
      label: newRuleLabel.trim() || `ยอด ${amt} บาท = ${newRuleAction === 'add' ? '+' : '-'}${mins} นาที`
    };

    setConfig(prev => ({
      ...prev,
      timer_tier_rules: [...prev.timer_tier_rules, newRule]
    }));

    setNewRuleLabel('');
    showToast(`เพิ่มกฎยอด ฿${amt} แล้ว อย่าลืมกดบันทึกการตั้งค่า`);
  };

  // Delete custom tier rule
  const handleDeleteTierRule = (id: string) => {
    setConfig(prev => ({
      ...prev,
      timer_tier_rules: prev.timer_tier_rules.filter(r => r.id !== id)
    }));
    showToast('ลบกฎแล้ว อย่าลืมกดบันทึกการตั้งค่า');
  };

  // Copy OBS link
  const copyObsLink = async (customUrl?: string) => {
    const url = customUrl || `${origin}/overlay/timer`;
    try {
      await navigator.clipboard.writeText(url);
      showToast('คัดลอกลิงก์ OBS เรียบร้อยแล้ว');
    } catch {
      showToast('ไม่สามารถคัดลอกได้ กรุณาเลือกและคัดลอกในช่อง');
    }
  };

  const { formatted } = formatTimerDisplay(liveSeconds);

  return (
    <div className="timer-admin-container">
      {/* Header */}
      <div className="timer-admin-header">
        <div className="timer-admin-title">
          <h1>
            <Clock size={28} style={{ color: '#0284c7' }} />
            ระบบจับเวลานับถอยหลัง & Subathon (Timer)
          </h1>
          <p>ควบคุมการนับถอยหลัง ปรับกฎการเพิ่ม/ลบเวลาจากการโดเนท และปรับแต่ง Widget บน OBS</p>
        </div>

        <button
          type="button"
          onClick={() => void handleSaveConfig()}
          disabled={saving || loading}
          className="timer-btn timer-btn-primary"
        >
          {saving ? 'กำลังบันทึก…' : 'บันทึกการตั้งค่าทั้งหมด'}
        </button>
      </div>

      {/* 1. Main Live Controller Card */}
      <div className="timer-control-card">
        <div className="timer-live-status">
          {config.timer_status === 'running' && (
            <span className="timer-status-badge status-badge-running">● กำลังนับถอยหลัง (RUNNING)</span>
          )}
          {config.timer_status === 'paused' && (
            <span className="timer-status-badge status-badge-paused">⏸ หยุดชั่วคราว (PAUSED)</span>
          )}
          {config.timer_status === 'stopped' && (
            <span className="timer-status-badge status-badge-ended">⏹ หมดเวลา / หยุดแล้ว (STOPPED)</span>
          )}
        </div>

        <div className="timer-live-digits">{formatted}</div>

        <div className="timer-actions-row">
          {config.timer_status !== 'running' ? (
            <button
              type="button"
              onClick={() => handleCommand(config.timer_status === 'paused' && liveSeconds > 0 ? 'resume' : 'start')}
              className="timer-btn timer-btn-success"
              disabled={loading}
            >
              <Play size={18} />
              {config.timer_status === 'paused' && liveSeconds > 0 ? 'นับเวลาต่อ (Resume)' : 'เริ่มนับถอยหลัง (Start)'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleCommand('pause')}
              className="timer-btn timer-btn-warning"
              disabled={loading}
            >
              <Pause size={18} />
              หยุดชั่วคราว (Pause)
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCommand('reset')}
            className="timer-btn timer-btn-secondary"
            disabled={loading}
            title="รีเซ็ตเวลากลับไปเป็นค่าเวลาเริ่มต้น"
          >
            <RotateCcw size={18} />
            รีเซ็ตเวลา (Reset)
          </button>
        </div>
      </div>

      {/* 2. Quick Adjust Buttons Bar */}
      <div className="timer-quick-adjust-card">
        <h2>⚡ ปรับเวลาด่วน (ส่งผลไปยัง OBS ทันที)</h2>
        <div className="quick-adjust-buttons">
          <div className="quick-adjust-group add-group">
            <button type="button" className="btn-adjust-add" onClick={() => handleQuickAdjust(60)}>+1 นาที</button>
            <button type="button" className="btn-adjust-add" onClick={() => handleQuickAdjust(300)}>+5 นาที</button>
            <button type="button" className="btn-adjust-add" onClick={() => handleQuickAdjust(900)}>+15 นาที</button>
            <button type="button" className="btn-adjust-add" onClick={() => handleQuickAdjust(1800)}>+30 นาที</button>
            <button type="button" className="btn-adjust-add" onClick={() => handleQuickAdjust(3600)}>+1 ชั่วโมง</button>
          </div>
          <span className="quick-adjust-divider" />
          <div className="quick-adjust-group sub-group">
            <button type="button" className="btn-adjust-sub" onClick={() => handleQuickAdjust(-60)}>-1 นาที</button>
            <button type="button" className="btn-adjust-sub" onClick={() => handleQuickAdjust(-300)}>-5 นาที</button>
            <button type="button" className="btn-adjust-sub" onClick={() => handleQuickAdjust(-900)}>-15 นาที</button>
          </div>
        </div>
      </div>

      {/* 3. Grid for Rules & Appearance */}
      <div className="timer-grid-2">
        {/* Left Column: Calculation Rules & Limits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Base Rate Rule */}
          <div className="timer-card">
            <h2>
              <Sliders size={20} style={{ color: '#0284c7' }} />
              อัตราส่วนพื้นฐาน (Default Rate)
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              คำนวณเวลาสำหรับยอดโดเนททั่วไปที่ไม่มีกฎพิเศษเจาะจง
            </p>

            <div className="timer-form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={config.timer_base_rate_enabled}
                  onChange={e => setConfig(prev => ({ ...prev, timer_base_rate_enabled: e.target.checked }))}
                />
                เปิดใช้งานการคำนวณตามอัตราส่วนพื้นฐาน
              </label>
            </div>

            {config.timer_base_rate_enabled && (
              <div className="timer-form-row">
                <div className="timer-form-group" style={{ flex: 1 }}>
                  <label>ทุก ๆ ยอดเงิน (บาท)</label>
                  <input
                    type="number"
                    min="1"
                    value={config.timer_base_rate_amount}
                    onChange={e => setConfig(prev => ({ ...prev, timer_base_rate_amount: Math.max(1, parseFloat(e.target.value) || 1) }))}
                  />
                </div>
                <div className="timer-form-group" style={{ flex: 1 }}>
                  <label>การกระทำ</label>
                  <select
                    value={config.timer_base_rate_action}
                    onChange={e => setConfig(prev => ({ ...prev, timer_base_rate_action: e.target.value as TimerAction }))}
                  >
                    <option value="add">➕ เพิ่มเวลา</option>
                    <option value="subtract">➖ ลบเวลา</option>
                  </select>
                </div>
                <div className="timer-form-group" style={{ flex: 1 }}>
                  <label>เวลา (วินาที)</label>
                  <input
                    type="number"
                    min="1"
                    value={config.timer_base_rate_seconds}
                    onChange={e => setConfig(prev => ({ ...prev, timer_base_rate_seconds: Math.max(1, parseInt(e.target.value) || 60) }))}
                  />
                </div>
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              ตัวอย่าง: ทุก <strong>{config.timer_base_rate_amount}</strong> บาท จะ{config.timer_base_rate_action === 'add' ? 'เพิ่ม' : 'ลบ'}เวลา <strong>{Math.round(config.timer_base_rate_seconds / 60)}</strong> นาที ({config.timer_base_rate_seconds} วินาที)
            </div>
          </div>

          {/* Custom Tier Rules */}
          <div className="timer-card">
            <h2>
              <Zap size={20} style={{ color: '#d97706' }} />
              กฎพิเศษเฉพาะยอดเงิน (Custom Tier Rules)
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              กำหนดยอดเงินที่ต้องการให้มีผลพิเศษ เช่น ยอด 50 บาท = ลบเวลา 10 นาที (คิดเป็นอันดับแรกก่อนอัตราส่วน)
            </p>

            {config.timer_tier_rules.length > 0 ? (
              <div className="timer-table-wrapper">
                <table className="tier-rules-table">
                  <thead>
                    <tr>
                      <th>ยอดเงิน (฿)</th>
                      <th>การกระทำ</th>
                      <th>ระยะเวลา</th>
                      <th>คำอธิบาย</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.timer_tier_rules.map(rule => (
                      <tr key={rule.id}>
                        <td><strong>฿{rule.amount}</strong></td>
                        <td>
                          {rule.action === 'add' ? (
                            <span className="tier-badge-add" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ArrowUpRight size={14} /> เพิ่มเวลา
                            </span>
                          ) : (
                            <span className="tier-badge-sub" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ArrowDownRight size={14} /> ลบเวลา
                            </span>
                          )}
                        </td>
                        <td>{Math.round(rule.seconds / 60)} นาที</td>
                        <td style={{ color: '#64748b' }}>{rule.label || '-'}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-rule-delete"
                            onClick={() => handleDeleteTierRule(rule.id)}
                            title="ลบกฎนี้"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>ยังไม่มีกฎพิเศษเฉพาะยอดเงิน</p>
            )}

            {/* Add new rule form */}
            <div className="timer-subcard">
              <div className="timer-subcard-title">+ เพิ่มกฎใหม่</div>
              <div className="timer-form-row">
                <div className="timer-form-group" style={{ flex: 1 }}>
                  <label>ยอดเงิน (฿)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="เช่น 50"
                    value={newRuleAmount}
                    onChange={e => setNewRuleAmount(e.target.value)}
                  />
                </div>
                <div className="timer-form-group" style={{ flex: 1 }}>
                  <label>การกระทำ</label>
                  <select
                    value={newRuleAction}
                    onChange={e => setNewRuleAction(e.target.value as TimerAction)}
                  >
                    <option value="subtract">➖ ลบเวลา</option>
                    <option value="add">➕ เพิ่มเวลา</option>
                  </select>
                </div>
                <div className="timer-form-group" style={{ flex: 1 }}>
                  <label>เวลา (นาที)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    placeholder="เช่น 10"
                    value={newRuleMinutes}
                    onChange={e => setNewRuleMinutes(e.target.value)}
                  />
                </div>
              </div>
              <div className="timer-form-group" style={{ marginTop: '8px' }}>
                <label>ป้ายข้อความ (ไม่บังคับ)</label>
                <input
                  type="text"
                  placeholder="เช่น โดเนทแกล้งลบเวลา"
                  value={newRuleLabel}
                  onChange={e => setNewRuleLabel(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleAddTierRule}
                className="timer-btn timer-btn-secondary"
                style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
              >
                <Plus size={16} /> เพิ่มกฎนี้
              </button>
            </div>
          </div>

          {/* Limits & Boundary */}
          <div className="timer-card">
            <h2>
              <ShieldAlert size={20} style={{ color: '#0284c7' }} />
              ขอบเขตเวลา & เวลาเริ่มต้น
            </h2>
            <div className="timer-form-row">
              <div className="timer-form-group" style={{ flex: 1 }}>
                <label>เวลาเริ่มต้นนับถอยหลัง (นาที)</label>
                <input
                  type="number"
                  min="1"
                  value={Math.round(config.timer_initial_seconds / 60)}
                  onChange={e => {
                    const mins = Math.max(1, parseInt(e.target.value) || 60);
                    setConfig(prev => ({ ...prev, timer_initial_seconds: mins * 60 }));
                  }}
                />
              </div>
              <div className="timer-form-group" style={{ flex: 1 }}>
                <label>เวลาสูงสุด (Max Cap ในนาที, 0 = ไม่จำกัด)</label>
                <input
                  type="number"
                  min="0"
                  value={Math.round(config.timer_max_cap_seconds / 60)}
                  onChange={e => {
                    const mins = Math.max(0, parseInt(e.target.value) || 0);
                    setConfig(prev => ({ ...prev, timer_max_cap_seconds: mins * 60 }));
                  }}
                />
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              เวลาเริ่มต้น: <strong>{Math.round(config.timer_initial_seconds / 60)} นาที</strong> ({Math.round(config.timer_initial_seconds / 3600)} ชม.) |
              เพดานสูงสุด: <strong>{config.timer_max_cap_seconds > 0 ? `${Math.round(config.timer_max_cap_seconds / 3600)} ชม.` : 'ไม่จำกัด'}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Appearance Customizer & Testing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Theme & Appearance */}
          <div className="timer-card">
            <h2>
              <Sparkles size={20} style={{ color: '#7c3aed' }} />
              รูปแบบ & ธีมหน้าตาของ Widget
            </h2>

            {/* Theme selector */}
            <div className="timer-form-group">
              <label>เลือกธีมสำเร็จรูป</label>
              <div className="theme-picker-grid">
                {[
                  { id: 'glass', name: 'Glassmorphism', desc: 'กระจกใสโมเดิร์น มินิมอล' },
                  { id: 'neon', name: 'Neon Cyberpunk', desc: 'ขอบเรืองแสง ดิจิทัลล้ำยุค' },
                  { id: 'minimal', name: 'Minimal Clean', desc: 'เรียบง่าย สบายตา' },
                  { id: 'retro', name: 'Retro Digital', desc: 'นาฬิกาไฟ LED ดิจิทัล' },
                ].map(t => (
                  <div
                    key={t.id}
                    className={`theme-card ${config.timer_appearance.theme === t.id ? 'active' : ''}`}
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      timer_appearance: { ...prev.timer_appearance, theme: t.id as TimerTheme }
                    }))}
                  >
                    <div className="theme-card-title">{t.name}</div>
                    <div className="theme-card-desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background Style Selector (เอาหรือไม่เอาพื้นหลัง) */}
            <div className="timer-form-group">
              <label>การแสดงผลพื้นหลัง (Widget Background)</label>
              <div className="bg-toggle-grid">
                <button
                  type="button"
                  className={`bg-toggle-btn ${config.timer_appearance.show_background !== false ? 'active' : ''}`}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, show_background: true }
                  }))}
                >
                  <span className="bg-toggle-icon">🖼️</span>
                  <div>
                    <div className="bg-toggle-title">มีพื้นหลังกล่อง (Card)</div>
                    <div className="bg-toggle-desc">แสดงสไตล์การ์ด มีสีพื้นหลัง กรอบ และเงาตามธีม</div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`bg-toggle-btn ${config.timer_appearance.show_background === false ? 'active' : ''}`}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, show_background: false }
                  }))}
                >
                  <span className="bg-toggle-icon">✨</span>
                  <div>
                    <div className="bg-toggle-title">โปร่งใส ไร้พื้นหลัง (Transparent)</div>
                    <div className="bg-toggle-desc">ไม่มีกรอบกล่อง ตัวเลขลอยเด่น ไม่บังฉากเกมใน OBS</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Elements Visibility Toggles */}
            <div className="timer-form-row" style={{ gap: '16px', marginTop: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                <input
                  type="checkbox"
                  checked={config.timer_appearance.show_title !== false}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, show_title: e.target.checked }
                  }))}
                />
                แสดงหัวข้อไตเติล
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                <input
                  type="checkbox"
                  checked={config.timer_appearance.show_donor_badge !== false}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, show_donor_badge: e.target.checked }
                  }))}
                />
                แสดงแถบผู้บริจาคล่าสุด
              </label>
            </div>

            {config.timer_appearance.show_background === false && (
              <div style={{ fontSize: '12.5px', color: '#0369a1', background: '#f0f9ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                💡 <strong>โหมดโปร่งใสเปิดใช้งานอยู่:</strong> หน้าจอ Overlay จะซ่อนสีพื้นหลัง ขอบ และเงากล่อง เหลือเฉพาะตัวเลขและข้อความที่คมชัด
              </div>
            )}

            <div className="timer-form-group">
              <label>หัวข้อตัวจับเวลา (Title Text)</label>
              <input
                type="text"
                value={config.timer_appearance.title}
                onChange={e => setConfig(prev => ({
                  ...prev,
                  timer_appearance: { ...prev.timer_appearance, title: e.target.value }
                }))}
              />
            </div>

            <div className="timer-form-row timer-form-row-colors">
              <div className="timer-form-group" style={{ flex: 1, opacity: config.timer_appearance.show_background === false ? 0.6 : 1 }}>
                <label>สีพื้นหลัง {config.timer_appearance.show_background === false && '(ปิดอยู่)'}</label>
                <input
                  type="color"
                  value={config.timer_appearance.bg_color}
                  disabled={config.timer_appearance.show_background === false}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, bg_color: e.target.value }
                  }))}
                  style={{ height: '38px', padding: '2px', cursor: config.timer_appearance.show_background === false ? 'not-allowed' : 'pointer' }}
                />
              </div>
              <div className="timer-form-group" style={{ flex: 1 }}>
                <label>สีตัวอักษรเวลา</label>
                <input
                  type="color"
                  value={config.timer_appearance.text_color}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, text_color: e.target.value }
                  }))}
                  style={{ height: '38px', padding: '2px', cursor: 'pointer' }}
                />
              </div>
              <div className="timer-form-group" style={{ flex: 1 }}>
                <label>สีตกแต่ง (Accent)</label>
                <input
                  type="color"
                  value={config.timer_appearance.accent_color}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, accent_color: e.target.value }
                  }))}
                  style={{ height: '38px', padding: '2px', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="timer-form-row">
              <div className="timer-form-group" style={{ flex: 1 }}>
                <label>ขนาดตัวเลขเวลา ({config.timer_appearance.digits_size}px)</label>
                <input
                  type="range"
                  min="32"
                  max="96"
                  value={config.timer_appearance.digits_size}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, digits_size: parseInt(e.target.value) || 54 }
                  }))}
                />
              </div>
              <div className="timer-form-group" style={{ flex: 1, opacity: config.timer_appearance.show_background === false ? 0.6 : 1 }}>
                <label>ความโปร่งใสกล่อง {config.timer_appearance.show_background === false ? '(ปิดอยู่)' : `(${config.timer_appearance.opacity}%)`}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={config.timer_appearance.show_background === false}
                  value={config.timer_appearance.opacity}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, opacity: parseInt(e.target.value) || 90 }
                  }))}
                />
              </div>
            </div>

            {/* เงาส่วนของตัวเลขนับเวลา (Digits Text Shadow) */}
            <div className="timer-sub-section">
              <div className="timer-sub-section-title">
                🌑 เงาของตัวเลขนับเวลา (Digits Text Shadow)
              </div>

              {/* Toggle On/Off */}
              <div className="stroke-toggle-grid">
                <button
                  type="button"
                  className={`stroke-toggle-btn ${config.timer_appearance.show_digits_shadow === false ? 'active' : ''}`}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    timer_appearance: { ...prev.timer_appearance, show_digits_shadow: false }
                  }))}
                >
                  🚫 ปิดเงาตัวเลข
                </button>
                <button
                  type="button"
                  className={`stroke-toggle-btn ${config.timer_appearance.show_digits_shadow !== false ? 'active' : ''}`}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    timer_appearance: {
                      ...prev.timer_appearance,
                      show_digits_shadow: true,
                      digits_shadow_color: prev.timer_appearance.digits_shadow_color || '#000000',
                      digits_shadow_blur: prev.timer_appearance.digits_shadow_blur ?? 8,
                      digits_shadow_x: prev.timer_appearance.digits_shadow_x ?? 0,
                      digits_shadow_y: prev.timer_appearance.digits_shadow_y ?? 2
                    }
                  }))}
                >
                  ✨ เปิดเงาตัวเลข
                </button>
              </div>

              {config.timer_appearance.show_digits_shadow !== false && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                  {/* Preset Styles */}
                  <div className="timer-form-group">
                    <label style={{ fontSize: '12.5px', color: '#475569' }}>พรีเซ็ตเงายอดนิยม (Quick Presets)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          timer_appearance: {
                            ...prev.timer_appearance,
                            digits_shadow_x: 0,
                            digits_shadow_y: 3,
                            digits_shadow_blur: 8,
                            digits_shadow_color: '#000000'
                          }
                        }))}
                      >
                        🌑 เงาตกกระทบ (Drop)
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          timer_appearance: {
                            ...prev.timer_appearance,
                            digits_shadow_x: 0,
                            digits_shadow_y: 2,
                            digits_shadow_blur: 2,
                            digits_shadow_color: '#000000'
                          }
                        }))}
                      >
                        ⬛ เงาคมชัด (Sharp)
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          timer_appearance: {
                            ...prev.timer_appearance,
                            digits_shadow_x: 0,
                            digits_shadow_y: 0,
                            digits_shadow_blur: 16,
                            digits_shadow_color: prev.timer_appearance.accent_color || '#38bdf8'
                          }
                        }))}
                      >
                        🌟 แสงเรือง (Neon Glow)
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          timer_appearance: {
                            ...prev.timer_appearance,
                            digits_shadow_x: 0,
                            digits_shadow_y: 0,
                            digits_shadow_blur: 25,
                            digits_shadow_color: prev.timer_appearance.accent_color || '#38bdf8'
                          }
                        }))}
                      >
                        🔮 เรืองแสงนุ่ม (Soft Glow)
                      </button>
                    </div>
                  </div>

                  {/* Color Picker & Preset Colors */}
                  <div className="timer-form-group">
                    <label>กำหนดสีของเงา (Shadow Color)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <input
                        type="color"
                        value={config.timer_appearance.digits_shadow_color?.startsWith('#') ? config.timer_appearance.digits_shadow_color : '#000000'}
                        onChange={e => setConfig(prev => ({
                          ...prev,
                          timer_appearance: { ...prev.timer_appearance, digits_shadow_color: e.target.value }
                        }))}
                        style={{ width: '44px', height: '36px', padding: '2px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={config.timer_appearance.digits_shadow_color || '#000000'}
                        onChange={e => setConfig(prev => ({
                          ...prev,
                          timer_appearance: { ...prev.timer_appearance, digits_shadow_color: e.target.value }
                        }))}
                        style={{ width: '110px', fontSize: '13px' }}
                      />
                      <div className="preset-colors-row">
                        {[
                          { color: '#000000', label: 'ดำ' },
                          { color: '#ffffff', label: 'ขาว' },
                          { color: config.timer_appearance.accent_color || '#38bdf8', label: 'สีธีม (Accent)' },
                          { color: '#ef4444', label: 'แดง' },
                          { color: '#eab308', label: 'ทอง' },
                          { color: '#22c55e', label: 'เขียว' },
                        ].map(c => (
                          <button
                            key={c.color + c.label}
                            type="button"
                            className={`preset-color-chip ${config.timer_appearance.digits_shadow_color === c.color ? 'active' : ''}`}
                            style={{ backgroundColor: c.color }}
                            onClick={() => setConfig(prev => ({
                              ...prev,
                              timer_appearance: { ...prev.timer_appearance, digits_shadow_color: c.color }
                            }))}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sliders: Blur, Offset Y, Offset X */}
                  <div className="timer-form-row">
                    <div className="timer-form-group" style={{ flex: 1 }}>
                      <label>ความฟุ้งเบลอ ({config.timer_appearance.digits_shadow_blur ?? 8}px)</label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={config.timer_appearance.digits_shadow_blur ?? 8}
                        onChange={e => setConfig(prev => ({
                          ...prev,
                          timer_appearance: { ...prev.timer_appearance, digits_shadow_blur: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="timer-form-group" style={{ flex: 1 }}>
                      <label>ระยะห่างแนวตั้ง Y ({config.timer_appearance.digits_shadow_y ?? 2}px)</label>
                      <input
                        type="range"
                        min="-10"
                        max="20"
                        value={config.timer_appearance.digits_shadow_y ?? 2}
                        onChange={e => setConfig(prev => ({
                          ...prev,
                          timer_appearance: { ...prev.timer_appearance, digits_shadow_y: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div className="timer-form-group" style={{ flex: 1 }}>
                      <label>ระยะห่างแนวนอน X ({config.timer_appearance.digits_shadow_x ?? 0}px)</label>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        value={config.timer_appearance.digits_shadow_x ?? 0}
                        onChange={e => setConfig(prev => ({
                          ...prev,
                          timer_appearance: { ...prev.timer_appearance, digits_shadow_x: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Simulation Box */}
          <div className="timer-card">
            <h2>
              <Zap size={20} style={{ color: '#16a34a' }} />
              ทดสอบจำลองโดเนท (Simulate Test)
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              ทดสอบว่ากฎและแอนิเมชันป้ายลอยบนจอ OBS ทำงานถูกต้องโดยไม่ต้องโอนเงินจริง
            </p>

            <div className="timer-form-row">
              <div className="timer-form-group" style={{ flex: 1 }}>
                <label>ยอดเงินจำลอง (บาท)</label>
                <input
                  type="number"
                  min="1"
                  value={simAmount}
                  onChange={e => setSimAmount(e.target.value)}
                />
              </div>
              <div className="timer-form-group" style={{ flex: 1 }}>
                <label>ชื่อผู้บริจาค</label>
                <input
                  type="text"
                  value={simDonor}
                  onChange={e => setSimDonor(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              className="timer-btn timer-btn-success"
              onClick={handleSimulate}
              disabled={simulating}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {simulating ? 'กำลังทดสอบ…' : '🚀 ส่งยอดทดสอบขึ้นจอ OBS'}
            </button>
          </div>

          {/* OBS Source Link & Live Preview */}
          <div className="timer-card">
            <h2>
              <ExternalLink size={20} style={{ color: '#0284c7' }} />
              ลิงก์สำหรับ OBS Browser Source
            </h2>
            <div className="timer-form-group">
              <label>ลิงก์หลักตามค่าที่บันทึกไว้ ({config.timer_appearance.show_background !== false ? 'มีพื้นหลัง' : 'โปร่งใสไร้พื้นหลัง'})</label>
              <div className="timer-source-box">
                <input
                  readOnly
                  value={`${origin}/overlay/timer`}
                  onFocus={e => e.target.select()}
                />
                <button
                  type="button"
                  className="timer-btn timer-btn-secondary"
                  onClick={() => copyObsLink(`${origin}/overlay/timer`)}
                >
                  <Copy size={16} /> คัดลอก
                </button>
                <a
                  href="/overlay/timer"
                  target="_blank"
                  rel="noreferrer"
                  className="timer-btn timer-btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  เปิด
                </a>
              </div>
            </div>

            <div className="timer-form-group" style={{ marginTop: '4px' }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>
                ✨ ลิงก์บังคับโปร่งใสไร้พื้นหลังโดยเฉพาะ (ต่อท้าย <code style={{ color: '#0284c7', background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>?bg=0</code> ไม่บังหน้าจอเกม):
              </label>
              <div className="timer-source-box">
                <input
                  readOnly
                  value={`${origin}/overlay/timer?bg=0`}
                  onFocus={e => e.target.select()}
                />
                <button
                  type="button"
                  className="timer-btn timer-btn-secondary"
                  onClick={() => copyObsLink(`${origin}/overlay/timer?bg=0`)}
                >
                  <Copy size={16} /> คัดลอก
                </button>
                <a
                  href="/overlay/timer?bg=0"
                  target="_blank"
                  rel="noreferrer"
                  className="timer-btn timer-btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  เปิด
                </a>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              แนะนำตั้งค่าใน OBS Browser Source: ความกว้าง <strong>520 px</strong>, ความสูง <strong>180 px</strong>
            </p>

            {/* Embedded Live Preview */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                พรีวิวสด (Live Preview) - {config.timer_appearance.show_background !== false ? 'โหมดมีพื้นหลัง' : 'โหมดโปร่งใสไร้พื้นหลัง'}
              </div>
              <div
                className="timer-preview-checkerboard"
                style={{
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  overflow: 'hidden',
                  height: '180px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <iframe
                  key={`${previewKey}-${config.timer_appearance.show_background !== false ? 'bg' : 'nobg'}-${config.timer_appearance.show_digits_shadow !== false ? 'sh1' : 'sh0'}-${config.timer_appearance.digits_shadow_color}-${config.timer_appearance.digits_shadow_blur}-${config.timer_appearance.digits_shadow_x}-${config.timer_appearance.digits_shadow_y}`}
                  title="Timer Live Preview"
                  src={`/overlay/timer?preview=1${config.timer_appearance.show_background === false ? '&bg=0' : '&bg=1'}${config.timer_appearance.show_digits_shadow === false ? '&shadow=0' : `&shadow=1&shadow_color=${encodeURIComponent(config.timer_appearance.digits_shadow_color || '#000000')}&shadow_blur=${config.timer_appearance.digits_shadow_blur ?? 8}`}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'transparent'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
