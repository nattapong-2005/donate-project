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

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/donations?limit=500', {
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

  // Reset to page 1 on search or filter change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: 'all' | 'verified' | 'pending') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
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

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedDonations = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredDonations.slice(start, start + pageSize);
  }, [filteredDonations, validCurrentPage, pageSize]);

  const startIndex = filteredDonations.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, filteredDonations.length);

  // Generate page numbers range (e.g., [1, 2, 3, '...', 10])
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (validCurrentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, validCurrentPage - 1);
      const end = Math.min(totalPages - 1, validCurrentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (validCurrentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, validCurrentPage]);

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
            พบ {filteredDonations.length} จากทั้งหมด {donations.length} รายการ (ยอดรวม: ฿{totalFilteredAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })})
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
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn sm ${filterStatus === 'all' ? 'primary' : 'secondary'}`}
            onClick={() => handleFilterChange('all')}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            className={`btn sm ${filterStatus === 'verified' ? 'primary' : 'secondary'}`}
            onClick={() => handleFilterChange('verified')}
          >
            Verified
          </button>
          <button
            type="button"
            className={`btn sm ${filterStatus === 'pending' ? 'primary' : 'secondary'}`}
            onClick={() => handleFilterChange('pending')}
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
            ) : paginatedDonations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '36px' }}>
                  {searchQuery || filterStatus !== 'all' ? 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา' : 'ยังไม่มีรายการโดเนท'}
                </td>
              </tr>
            ) : (
              paginatedDonations.map((item) => (
                <tr key={item.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }) : '-'}
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

      {/* Pagination Controls */}
      {filteredDonations.length > 0 && (
        <div className="pagination-wrapper">
          <div className="pagination-left">
            <div className="pagination-size-wrapper">
              <span>แสดง</span>
              <select
                className="pagination-size-select"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                aria-label="จำนวนรายการต่อหน้า"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>รายการ / หน้า</span>
            </div>

            <div className="pagination-info">
              แสดง <strong>{startIndex} - {endIndex}</strong> จาก <strong>{filteredDonations.length}</strong> รายการ (หน้า <strong>{validCurrentPage}</strong>/{totalPages})
            </div>
          </div>

          <div className="pagination-controls">
            {/* First Page Button */}
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage <= 1}
              title="หน้าแรก"
              aria-label="หน้าแรก"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            </button>

            {/* Previous Page Button */}
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={validCurrentPage <= 1}
              title="หน้าก่อนหน้า"
              aria-label="หน้าก่อนหน้า"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Numbered Page Buttons */}
            {pageNumbers.map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                    …
                  </span>
                );
              }
              const pageNum = p as number;
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`pagination-btn ${validCurrentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-current={validCurrentPage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page Button */}
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage >= totalPages}
              title="หน้าถัดไป"
              aria-label="หน้าถัดไป"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Last Page Button */}
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage >= totalPages}
              title="หน้าสุดท้าย"
              aria-label="หน้าสุดท้าย"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
