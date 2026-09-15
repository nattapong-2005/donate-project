'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, X, Loader2 } from 'lucide-react';
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
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} />
          จัดการคำหยาบและคำต้องห้าม (Blacklist)
        </h2>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: '999px',
          background: '#f1f5f9',
          color: '#475569'
        }}>
          ทั้งหมด {blacklist.length} คำ
        </span>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
        คำที่อยู่ในรายการนี้จะถูกเซ็นเซอร์เป็น <code style={{ color: 'var(--danger)', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>***</code> โดยอัตโนมัติก่อนส่งขึ้นหน้าจอ OBS
      </p>

      <form onSubmit={handleAddBlacklist} className="blacklist-form">
        <input
          type="text"
          className="input-control"
          placeholder="พิมพ์คำที่ต้องการบล็อก..."
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          disabled={isAdding}
        />
        <button
          type="submit"
          className="btn"
          disabled={isAdding || !newWord.trim()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {isAdding ? (
            <>
              <Loader2 size={16} className="spinner-icon" />
              <span>กำลังเพิ่ม...</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>เพิ่มคำ</span>
            </>
          )}
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
              <button
                type="button"
                className="tag-remove"
                onClick={() => handleDeleteBlacklist(item.id)}
                title={`ลบ "${item.word}" ออกจากแบล็กลิสต์`}
                aria-label={`ลบคำ ${item.word}`}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
