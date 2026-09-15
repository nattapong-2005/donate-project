'use client';

import React, { useState, useEffect } from 'react';
import { AlertSettings } from '@/lib/types/database';
import { useAdmin } from '../AdminContext';

export default function AdminSettingsPage() {
  const { showToast, handleUnauthorized } = useAdmin();
  const [settings, setSettings] = useState<AlertSettings>({
    promptpay_id: '',
    receiver_name: '',
    receiver_account: '',
    min_donate: '5',
    alert_duration: 8,
    alert_volume: 80,
    tts_enabled: 'true',
    tts_min_amount: 20
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/settings', {
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [handleUnauthorized]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!');
      } else {
        alert(data.message || 'บันทึกการตั้งค่าไม่สำเร็จ');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-dim)' }}>
        กำลังโหลดการตั้งค่าระบบ...
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          ตั้งค่าพร้อมเพย์ & ระบบ OBS Alert
        </h2>
      </div>

      <form onSubmit={handleSaveSettings}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="settingPromptPayId">
              หมายเลข PromptPay (เบอร์โทร 10 หลัก หรือ ปชช 13 หลัก)
            </label>
            <input
              type="text"
              id="settingPromptPayId"
              className="input-control"
              placeholder="0649520055"
              value={settings.promptpay_id || ''}
              onChange={(e) => setSettings({ ...settings, promptpay_id: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settingMinDonate">ยอดโดเนทขั้นต่ำ (บาท)</label>
            <input
              type="number"
              id="settingMinDonate"
              className="input-control"
              min="1"
              value={settings.min_donate || '1'}
              onChange={(e) => setSettings({ ...settings, min_donate: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="settingAlertDuration">ระยะเวลาแสดง Alert บน OBS (วินาที)</label>
            <input
              type="number"
              id="settingAlertDuration"
              className="input-control"
              min="3"
              max="30"
              value={settings.alert_duration || 8}
              onChange={(e) => setSettings({ ...settings, alert_duration: parseInt(e.target.value) || 8 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settingAlertVolume">
              ระดับเสียงแจ้งเตือน ({settings.alert_volume || 80}%)
            </label>
            <input
              type="range"
              id="settingAlertVolume"
              min="0"
              max="100"
              value={settings.alert_volume || 80}
              onChange={(e) => setSettings({ ...settings, alert_volume: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', marginTop: '10px' }}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="settingTtsEnabled">ระบบอ่านออกเสียง (TTS)</label>
            <select
              id="settingTtsEnabled"
              className="input-control"
              value={String(settings.tts_enabled)}
              onChange={(e) => setSettings({ ...settings, tts_enabled: e.target.value })}
            >
              <option value="true">เปิดใช้งาน (อ่านชื่อ ยอดเงิน และข้อความ)</option>
              <option value="false">ปิดใช้งาน</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settingTtsMinAmount">ยอดเงินขั้นต่ำที่จะให้อ่าน TTS (บาท)</label>
            <input
              type="number"
              id="settingTtsMinAmount"
              className="input-control"
              value={settings.tts_min_amount || 20}
              onChange={(e) => setSettings({ ...settings, tts_min_amount: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <h3 style={{ fontSize: '15px', margin: '24px 0 10px', color: 'var(--text-main)', fontWeight: 700 }}>
          ระบบตรวจสอบความปลอดภัยสลิปเพิ่มเติม (Optional)
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '14px' }}>
          หากระบุข้อมูลด้านล่าง ระบบจะปฏิเสธสลิปที่ชื่อหรือเลขบัญชีปลายทางไม่ตรงกับที่ระบุ (เว้นว่างไว้เพื่อตรวจเฉพาะยอดเงินและสลิปซ้ำ)
        </p>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="settingReceiverName">ชื่อผู้รับเงินในบัญชี (บางส่วนหรือเต็ม)</label>
            <input
              type="text"
              id="settingReceiverName"
              className="input-control"
              placeholder="เช่น นาย สวัสดี"
              value={settings.receiver_name || ''}
              onChange={(e) => setSettings({ ...settings, receiver_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="settingReceiverAccount">เลขบัญชีผู้รับเงิน (เฉพาะตัวเลข)</label>
            <input
              type="text"
              id="settingReceiverAccount"
              className="input-control"
              placeholder="เช่น 0123456789"
              value={settings.receiver_account || ''}
              onChange={(e) => setSettings({ ...settings, receiver_account: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn" style={{ marginTop: '14px' }} disabled={isSaving}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}
        </button>
      </form>
    </div>
  );
}
