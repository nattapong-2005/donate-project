'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Donation } from '@/lib/types/database';
import { useAdmin } from '../AdminContext';

export default function AdminDonationsPage() {
  const { showToast, handleUnauthorized, refreshCounts } = useAdmin();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/donations?limit=100', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setDonations(data.donations || []);
        refreshCounts();
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleReplayAlert = async (item: Donation) => {
    try {
      const res = await fetch('/api/admin/replay-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          amount: item.amount,
          message: item.message
        })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast(`เล่นซ้ำการแจ้งเตือนของ ${item.name || 'ไม่ระบุชื่อ'} (฿${item.amount}) แล้ว!`);
      } else {
        alert(data.message || 'เล่นซ้ำการแจ้งเตือนไม่สำเร็จ');
      }
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    }
  };

  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.transaction_ref && item.transaction_ref.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.trans_ref && item.trans_ref.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'verified' && item.status !== 'pending') ||
        (filterStatus === 'pending' && item.status === 'pending');

      return matchSearch && matchStatus;
    });
  }, [donations, searchQuery, filterStatus]);

  const totalFilteredAmount = useMemo(() => {
    return filteredDonations.reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);
  }, [filteredDonations]);

  return (
    <div className="panel">
      <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            ประวัติรายการโดเนททั้งหมด
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
            แสดงผล {filteredDonations.length} จากทั้งหมด {donations.length} รายการ (ยอดรวม: ฿{totalFilteredAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn secondary sm" onClick={fetchDonations} disabled={isLoading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            {isLoading ? 'กำลังโหลด...' : 'รีเฟรชตาราง'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '10px', margin: '16px 0 20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '220px' }}>
          <input
            type="text"
            className="input-control"
            placeholder="ค้นหาชื่อ, ข้อความ หรือ Ref สลิป..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn sm ${filterStatus === 'all' ? 'primary' : 'secondary'}`}
            onClick={() => setFilterStatus('all')}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            className={`btn sm ${filterStatus === 'verified' ? 'primary' : 'secondary'}`}
            onClick={() => setFilterStatus('verified')}
          >
            Verified
          </button>
          <button
            type="button"
            className={`btn sm ${filterStatus === 'pending' ? 'primary' : 'secondary'}`}
            onClick={() => setFilterStatus('pending')}
          >
            รอตรวจสอบ
          </button>
        </div>
      </div>

      {/* Table */}
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
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '36px' }}>
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : filteredDonations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '36px' }}>
                  {searchQuery || filterStatus !== 'all' ? 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา' : 'ยังไม่มีรายการโดเนท'}
                </td>
              </tr>
            ) : (
              filteredDonations.map((item) => (
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
  );
}
