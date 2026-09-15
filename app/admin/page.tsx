'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import './admin.css';
import { Donation, BlacklistWord, AlertSettings } from '@/lib/types/database';
import { supabase } from '@/lib/supabaseClient';
import { Sidebar, MobileTopBar, StatCard, Toast, Modal } from '@/app/components';

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [stats, setStats] = useState<{ count: number; totalAmount: number; todayCount: number; todayAmount: number }>({
    count: 0,
    totalAmount: 0,
    todayCount: 0,
    todayAmount: 0
  });
  const [quota, setQuota] = useState<any>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistWord[]>([]);
  const [newWord, setNewWord] = useState<string>('');
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

  const [activeTab, setActiveTab] = useState<'tabOverview' | 'tabDonations' | 'tabSettings' | 'tabBlacklist'>('tabOverview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{ username: string; displayName?: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [testName, setTestName] = useState<string>('Naaa ผู้สนับสนุนตัวอย่าง');
  const [testAmount, setTestAmount] = useState<string>('50');
  const [testMessage, setTestMessage] = useState<string>('สู้ๆ ครับแอดมิน เล่นเกมเก่งมาก!');

  useEffect(() => {
    const saved = localStorage.getItem('donate_admin_token') || '';
    setAdminToken(saved);
    setTokenInput(saved);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['tabOverview', 'tabDonations', 'tabSettings', 'tabBlacklist'].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminToken) headers['x-admin-token'] = adminToken;
    return headers;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('donate_admin_token');
    window.location.href = '/login';
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Check current logged in user
      const meRes = await fetch('/api/auth/me', { headers: getHeaders() });
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.authenticated) {
          setCurrentUser(meData.user);
        }
      }

      const sRes = await fetch('/api/admin/stats', { headers: getHeaders() });
      if (sRes.status === 401) {
        setIsAuthModalOpen(true);
        setIsLoading(false);
        return;
      }
      const sData = await sRes.json();
      if (sData.success) {
        setStats(sData.stats);
        if (sData.quota) setQuota(sData.quota);
      }

      const dRes = await fetch('/api/admin/donations?limit=50', { headers: getHeaders() });
      const dData = await dRes.json();
      if (dData.success) setDonations(dData.donations || []);

      const bRes = await fetch('/api/admin/blacklist');
      const bData = await bRes.json();
      if (bData.success) setBlacklist(bData.blacklist || []);

      const setRes = await fetch('/api/admin/settings', { headers: getHeaders() });
      const setData = await setRes.json();
      if (setData.success && setData.settings) {
        setSettings(prev => ({ ...prev, ...setData.settings }));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminToken]);

  // Realtime subscription for incoming donations (matching Socket.IO in original app)
  useEffect(() => {
    const channel = supabase.channel('donation-alerts', { config: { private: true } });
    channel
      .on('broadcast', { event: 'donation' }, (payload: any) => {
        const alertData = payload.payload;
        if (alertData && alertData.name) {
          showToast(`มีโดเนทใหม่จากคุณ ${alertData.name} ฿${alertData.amount}`);
        }
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminToken]);

  const topDonator = useMemo(() => {
    if (!donations.length) return '-';
    const donatorTotals: Record<string, number> = {};
    donations.forEach(d => {
      const name = (d.name || 'Anonymous').trim();
      donatorTotals[name] = (donatorTotals[name] || 0) + (parseFloat(String(d.amount)) || 0);
    });
    let top = '-';
    let max = 0;
    for (const [name, total] of Object.entries(donatorTotals)) {
      if (total > max) {
        max = total;
        top = `${name} (฿${total.toLocaleString()})`;
      }
    }
    return top;
  }, [donations]);

  const handleSaveAuthToken = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('donate_admin_token', tokenInput);
    setAdminToken(tokenInput);
    setIsAuthModalOpen(false);
    showToast('บันทึกกุญแจความปลอดภัย Admin Token เรียบร้อยแล้ว');
  };

  const handleSendTestAlert = async () => {
    try {
      const res = await fetch('/api/admin/test-alert', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: testName,
          amount: parseFloat(testAmount) || 50,
          message: testMessage
        })
      });
      if (res.status === 401) {
        setIsAuthModalOpen(true);
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('ส่ง Test Alert ขึ้นหน้าจอ OBS เรียบร้อยแล้ว!');
      } else {
        alert(data.message || 'ส่ง Test Alert ไม่สำเร็จ');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    }
  };

  const handleReplayAlert = async (item: Donation) => {
    try {
      const res = await fetch('/api/admin/replay-alert', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          amount: item.amount,
          message: item.message
        })
      });
      if (res.status === 401) {
        setIsAuthModalOpen(true);
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast(`เล่นซ้ำการแจ้งเตือนของ ${item.name} (฿${item.amount}) แล้ว!`);
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    }
  };

  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    try {
      const res = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ word: newWord.trim() })
      });
      if (res.status === 401) {
        setIsAuthModalOpen(true);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setNewWord('');
        fetchData();
        showToast('เพิ่มคำต้องห้ามเรียบร้อยแล้ว');
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteBlacklist = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/blacklist?id=${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.status === 401) {
        setIsAuthModalOpen(true);
        return;
      }
      const data = await res.json();
      if (data.success) {
        fetchData();
        showToast('ลบคำออกจากแบล็กลิสต์แล้ว');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });
      if (res.status === 401) {
        setIsAuthModalOpen(true);
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว!');
      } else {
        alert(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="admin-layout">
      {/* Reusable Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        donationCount={stats.count}
        blacklistCount={blacklist.length}
        currentUser={currentUser}
        adminToken={adminToken}
        onOpenTokenModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Reusable Mobile Top Bar */}
        <MobileTopBar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          title="Streamer Dashboard"
          rightAction={<span className="brand-badge">SlipOK + OBS</span>}
        />

        <div className="container">
          {/* Reusable Stats Overview Cards */}
          <div className="stats-grid">
            <StatCard
              iconVariant="green"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              }
              title="ยอดโดเนทวันนี้"
              value={`฿${(stats.todayAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${stats.todayCount || 0} รายการ`}
            />

            <StatCard
              iconVariant="blue"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              }
              title="ยอดรวมทั้งหมด"
              value={`฿${(stats.totalAmount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle={`${stats.count || 0} รายการ`}
            />

            <StatCard
              iconVariant="purple"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
                  <line x1="13" y1="5" x2="13" y2="19" strokeDasharray="2"></line>
                </svg>
              }
              title="โควต้า SlipOK คงเหลือ"
              value={quota ? `${quota.quota ?? quota.remaining ?? quota.limit ?? 100} สลิป` : '100 สลิป'}
              subtitle={quota ? (quota.endDate ? `หมดอายุ ${quota.endDate}` : quota.status ? `สถานะ: ${quota.status}` : 'ปกติ') : 'ตรวจสอบสถานะ...'}
            />

            <StatCard
              iconVariant="orange"
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              }
              title="ผู้สนับสนุนสูงสุด"
              value={<span style={{ fontSize: '17px', wordBreak: 'break-word' }}>{topDonator}</span>}
              subtitle="Top Supporter"
            />
          </div>

        {/* Tab 1: Overview & Quick Test Alert */}
        {activeTab === 'tabOverview' && (
          <div className="tab-pane active">
            {/* Alert Customizer Banner */}
            <div className="panel" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '22px 28px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span>🎨</span> สตูดิโอปรับแต่ง UI โดเนทขึ้นจอ OBS (Customizer Studio)
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                  ปรับแต่งสีการ์ด ฟอนต์ ป้ายยอดเงิน ไอคอน และอนิเมชั่น พร้อมหน้าต่าง Live Preview และซิงค์ขึ้น OBS ทันทีแบบ Real-time
                </p>
              </div>
              <Link href="/customizer" className="btn primary" style={{ background: '#2563eb', border: 'none', color: '#ffffff', padding: '12px 22px', fontWeight: 700, textDecoration: 'none', borderRadius: '8px' }}>
                เปิดสตูดิโอปรับแต่ง UI →
              </Link>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="22" y1="12" x2="18" y2="12"></line>
                    <line x1="6" y1="12" x2="2" y2="12"></line>
                    <line x1="12" y1="6" x2="12" y2="2"></line>
                    <line x1="12" y1="22" x2="12" y2="18"></line>
                  </svg>
                  ทดสอบระบบ Alert ขึ้นจอ OBS (Test Alert)
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                กดปุ่มนี้เพื่อส่งข้อมูลตัวอย่างขึ้นหน้าจอ OBS Overlay ทันทีโดยไม่ต้องโอนเงินจริง (มีเสียงเอฟเฟกต์และเสียงอ่าน TTS ตามที่ตั้งค่าไว้)
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="testName">ชื่อผู้สนับสนุนตัวอย่าง</label>
                  <input
                    type="text"
                    id="testName"
                    className="input-control"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="testAmount">จำนวนเงิน (บาท)</label>
                  <input
                    type="number"
                    id="testAmount"
                    className="input-control"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="testMessage">ข้อความตัวอย่าง</label>
                <input
                  type="text"
                  id="testMessage"
                  className="input-control"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>

              <button type="button" className="btn" onClick={handleSendTestAlert}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                ส่ง Test Alert ขึ้นหน้าจอ OBS
              </button>
            </div>

            {/* OBS Setup Instructions Guide */}
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  วิธีเพิ่ม Alert เข้าโปรแกรม OBS Studio
                </h2>
              </div>
              <ol style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>เปิดโปรแกรม <strong>OBS Studio</strong></li>
                <li>ในช่อง <strong>Sources</strong> กดปุ่มเครื่องหมายบวก <strong>(+)</strong> แล้วเลือก <strong>Browser</strong></li>
                <li>ตั้งชื่อเช่น <code>Donate Alert</code> แล้วกด OK</li>
                <li>ในช่อง <strong>URL</strong> ให้กรอก: <code style={{ color: 'var(--primary)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>http://localhost:3000/overlay</code></li>
                <li>ตั้งค่า <strong>Width:</strong> <code>1920</code> และ <strong>Height:</strong> <code>1080</code> (หรือ 800x600)</li>
                <li>ติ๊กถูกที่ <strong>Shutdown source when not visible</strong> และ <strong>Refresh browser when scene becomes active</strong></li>
                <li>กด <strong>OK</strong> จากนั้นกลับมากดปุ่ม <strong>ส่ง Test Alert</strong> ด้านบนเพื่อเช็คตำแหน่งบนหน้าจอได้ทันที</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Donations Table */}
        {activeTab === 'tabDonations' && (
          <div className="tab-pane active">
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  ประวัติรายการโดเนททั้งหมด
                </h2>
                <button type="button" className="btn secondary sm" onClick={fetchData}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  รีเฟรชตาราง
                </button>
              </div>

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>วัน-เวลา</th>
                      <th>ชื่อผู้สนับสนุน</th>
                      <th>ยอดเงิน</th>
                      <th>ข้อความ</th>
                      <th>ข้อมูลสลิป / Ref</th>
                      <th>สถานะ</th>
                      <th>การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : donations.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '30px' }}>
                          ยังไม่มีรายการโดเนท
                        </td>
                      </tr>
                    ) : (
                      donations.map((item) => (
                        <tr key={item.id}>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                            {item.created_at ? new Date(item.created_at).toLocaleString('th-TH') : '-'}
                          </td>
                          <td style={{ fontWeight: 600 }}>{item.name || 'ไม่ระบุชื่อ'}</td>
                          <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                            ฿{(parseFloat(String(item.amount)) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ maxWidth: '280px', wordBreak: 'break-word', color: 'var(--text-muted)' }}>
                            {item.message || '-'}
                          </td>
                          <td style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                            {item.transaction_ref || item.trans_ref || item.slip_url || '-'}
                          </td>
                          <td>
                            <span className={`badge ${item.status === 'pending' ? 'pending' : 'verified'}`}>
                              {item.status === 'pending' ? 'รอตรวจสอบ' : 'Verified'}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn secondary sm"
                              onClick={() => handleReplayAlert(item)}
                              title="ส่งการแจ้งเตือนขึ้นจอ OBS อีกครั้ง"
                            >
                              ▶ เล่นซ้ำ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'tabSettings' && (
          <div className="tab-pane active">
            <form onSubmit={handleSaveSettings} className="panel">
              <div className="panel-header">
                <h2 className="panel-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  ตั้งค่าพร้อมเพย์ & ระบบ OBS Alert
                </h2>
              </div>

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

              <h3 style={{ fontSize: '15px', margin: '20px 0 10px', color: 'var(--text-main)', fontWeight: 700 }}>
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

              <button type="submit" className="btn" style={{ marginTop: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                บันทึกการตั้งค่าทั้งหมด
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Blacklist Words */}
        {activeTab === 'tabBlacklist' && (
          <div className="tab-pane active">
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  จัดการคำหยาบและคำต้องห้าม (Blacklist)
                </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                คำที่อยู่ในรายการนี้จะถูกเซ็นเซอร์เป็น <code style={{ color: 'var(--danger)', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>***</code> โดยอัตโนมัติก่อนส่งขึ้นหน้าจอ OBS
              </p>

              <form onSubmit={handleAddBlacklist} style={{ display: 'flex', gap: '10px', maxWidth: '450px' }}>
                <input
                  type="text"
                  className="input-control"
                  placeholder="พิมพ์คำที่ต้องการบล็อก..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                />
                <button type="submit" className="btn">
                  เพิ่มคำ
                </button>
              </form>

              <div className="tags-list">
                {blacklist.length === 0 ? (
                  <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>ยังไม่มีคำในแบล็กลิสต์</span>
                ) : (
                  blacklist.map((item) => (
                    <span key={item.id} className="tag-item">
                      {item.word}
                      <span className="tag-remove" onClick={() => handleDeleteBlacklist(item.id)}>×</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Token Key Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={
          <>
            <span>🔑</span> กุญแจความปลอดภัย Admin Token
          </>
        }
      >
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
          กรุณากรอกกุญแจ <code>ADMIN_API_TOKEN</code> ให้ตรงกับที่กำหนดไว้ในไฟล์ <code>.env.local</code> เพื่อเข้าถึงการจัดการระบบ
        </p>

        <form onSubmit={handleSaveAuthToken}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <input
              type="password"
              className="input-control"
              placeholder="กรอก Admin Token..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn secondary sm"
              onClick={() => setIsAuthModalOpen(false)}
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn sm">
              บันทึก Token
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast Notification */}
      <Toast message={toastMessage} />
      </div>
    </div>
  );
}
