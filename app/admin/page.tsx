'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Donation } from '@/lib/types/database';
import { StatCard } from '@/app/components';
import { useAdmin } from './AdminContext';

function AdminOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast, handleUnauthorized, refreshCounts } = useAdmin();

  const [stats, setStats] = useState<{ count: number; totalAmount: number; todayCount: number; todayAmount: number }>({
    count: 0,
    totalAmount: 0,
    todayCount: 0,
    todayAmount: 0
  });
  const [quota, setQuota] = useState<any>(null);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [testName, setTestName] = useState<string>('Naaa ผู้สนับสนุนตัวอย่าง');
  const [testAmount, setTestAmount] = useState<string>('50');
  const [testMessage, setTestMessage] = useState<string>('สู้ๆ ครับแอดมิน เล่นเกมเก่งมาก!');

  // Redirect legacy ?tab= queries to new routes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'tabDonations') {
      router.replace('/admin/donations');
    } else if (tab === 'tabSettings') {
      router.replace('/admin/settings');
    } else if (tab === 'tabBlacklist') {
      router.replace('/admin/blacklist');
    }
  }, [searchParams, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const sRes = await fetch('/api/admin/stats', { headers: { 'Content-Type': 'application/json' } });
      if (sRes.status === 401) {
        handleUnauthorized();
        return;
      }
      const sData = await sRes.json();
      if (sData.success) {
        setStats(sData.stats);
        if (sData.quota) setQuota(sData.quota);
      }

      const dRes = await fetch('/api/admin/donations?limit=5', { headers: { 'Content-Type': 'application/json' } });
      const dData = await dRes.json();
      if (dData.success) {
        setRecentDonations(dData.donations || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const topDonator = useMemo(() => {
    if (!recentDonations.length) return '-';
    const donatorTotals: Record<string, number> = {};
    recentDonations.forEach(d => {
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
  }, [recentDonations]);

  const handleSendTestAlert = async () => {
    try {
      const res = await fetch('/api/admin/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: testName,
          amount: parseFloat(testAmount) || 50,
          message: testMessage
        })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('ส่ง Test Alert ขึ้นหน้าจอ OBS เรียบร้อยแล้ว!');
        refreshCounts();
      } else {
        alert(data.message || 'ส่ง Test Alert ไม่สำเร็จ');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    }
  };

  return (
    <>
      {/* Stats Overview Cards */}
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

      {/* Test Alert Panel */}
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

      {/* Recent Donations Preview */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            รายการโดเนทล่าสุด
          </h2>
          <Link href="/admin/donations" className="btn secondary sm" style={{ textDecoration: 'none' }}>
            ดูประวัติทั้งหมด ({stats.count || 0}) →
          </Link>
        </div>

        {isLoading ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>กำลังโหลดข้อมูล...</p>
        ) : recentDonations.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีรายการโดเนท</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>วัน-เวลา</th>
                  <th>ชื่อผู้สนับสนุน</th>
                  <th>ยอดเงิน</th>
                  <th>ข้อความ</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((item) => (
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
                    <td>
                      <span className={`badge ${item.status === 'pending' ? 'pending' : 'verified'}`}>
                        {item.status === 'pending' ? 'รอตรวจสอบ' : 'Verified'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    </>
  );
}

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>กำลังโหลด...</div>}>
      <AdminOverviewContent />
    </Suspense>
  );
}
