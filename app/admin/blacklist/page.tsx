'use client';

import React, { useState, useEffect } from 'react';
import { BlacklistWord } from '@/lib/types/database';
import { useAdmin } from '../AdminContext';

export default function AdminBlacklistPage() {
  const { showToast, handleUnauthorized, refreshCounts } = useAdmin();
  const [blacklist, setBlacklist] = useState<BlacklistWord[]>([]);
  const [newWord, setNewWord] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const fetchBlacklist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/blacklist', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setBlacklist(data.blacklist || []);
        refreshCounts();
      }
    } catch (err) {
      console.error('Error fetching blacklist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord.trim() })
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setNewWord('');
        fetchBlacklist();
        showToast('เพิ่มคำต้องห้ามเรียบร้อยแล้ว');
      } else {
        alert(data.message || 'เพิ่มคำต้องห้ามไม่สำเร็จ');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBlacklist = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/blacklist?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        fetchBlacklist();
        showToast('ลบคำออกจากแบล็กลิสต์แล้ว');
      } else {
        alert(data.message || 'ลบคำไม่สำเร็จ');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
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

      <form onSubmit={handleAddBlacklist} style={{ display: 'flex', gap: '10px', maxWidth: '450px', marginBottom: '24px' }}>
        <input
          type="text"
          className="input-control"
          placeholder="พิมพ์คำที่ต้องการบล็อก..."
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          disabled={isAdding}
        />
        <button type="submit" className="btn" disabled={isAdding || !newWord.trim()}>
          {isAdding ? 'กำลังเพิ่ม...' : 'เพิ่มคำ'}
        </button>
      </form>

      <div className="tags-list">
        {isLoading ? (
          <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>กำลังโหลดคำต้องห้าม...</span>
        ) : blacklist.length === 0 ? (
          <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>ยังไม่มีคำในแบล็กลิสต์</span>
        ) : (
          blacklist.map((item) => (
            <span key={item.id} className="tag-item">
              {item.word}
              <span
                className="tag-remove"
                onClick={() => handleDeleteBlacklist(item.id)}
                title="ลบคำนี้"
                role="button"
                tabIndex={0}
              >
                ×
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
