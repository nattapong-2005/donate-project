'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  role: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function AdminProfilePage() {
  const { showToast, handleUnauthorized, setCurrentUser } = useAdmin();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form: Profile General
  const [displayName, setDisplayName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Form: Password Change
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Copy ID feedback
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/profile', {
          headers: { 'Content-Type': 'application/json' }
        });

        if (res.status === 401) {
          handleUnauthorized();
          return;
        }

        const data = await res.json();
        if (data.success && data.user) {
          setProfile(data.user);
          setDisplayName(data.user.displayName || '');
          setUsername(data.user.username || '');
        }
      } catch (err) {
        console.error('Error fetching admin profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [handleUnauthorized]);

  // Handle Save Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    const cleanName = displayName.trim();
    const cleanUser = username.trim().toLowerCase();

    if (!cleanName) {
      setProfileMessage({ text: 'กรุณากรอกชื่อที่แสดง (Display Name)', isError: true });
      return;
    }

    if (!cleanUser || cleanUser.length < 3) {
      setProfileMessage({ text: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร', isError: true });
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: cleanName,
          username: cleanUser
        })
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (data.success && data.user) {
        setProfile(data.user);
        setDisplayName(data.user.displayName || '');
        setUsername(data.user.username || '');

        // Update layout sidebar user immediately
        setCurrentUser({
          id: data.user.id,
          username: data.user.username,
          displayName: data.user.displayName,
          role: data.user.role
        });

        setProfileMessage({ text: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว', isError: false });
        showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');
      } else {
        setProfileMessage({ text: data.message || 'บันทึกข้อมูลไม่สำเร็จ', isError: true });
      }
    } catch (err: any) {
      setProfileMessage({ text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', isError: true });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ text: 'กรุณาระบุรหัสผ่านปัจจุบันเพื่อความปลอดภัย', isError: true });
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setPasswordMessage({ text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร', isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน', isError: true });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await res.json();
      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordMessage({ text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว ปลอดภัยสำหรับใช้งานครั้งถัดไป', isError: false });
        showToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!');
      } else {
        setPasswordMessage({ text: data.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ', isError: true });
      }
    } catch (err: any) {
      setPasswordMessage({ text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', isError: true });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      showToast('คัดลอก User ID เรียบร้อยแล้ว');
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'ไม่มีข้อมูล';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' น.';
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }}>
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        <div>กำลังโหลดข้อมูลโปรไฟล์...</div>
      </div>
    );
  }

  const avatarChar = (profile?.displayName || profile?.username || 'A')[0].toUpperCase();

  return (
    <div>
      {/* Profile Overview Card */}
      <div className="profile-overview-card">
        <div className="profile-header-main">
          <div className="profile-avatar-xl">
            {avatarChar}
          </div>
          <div className="profile-header-text">
            <div className="profile-title-name">
              <span>{profile?.displayName || profile?.username || 'ผู้ดูแลระบบ'}</span>
              <span className="profile-badge">
                {profile?.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : profile?.role || 'Admin'}
              </span>
            </div>
            <div className="profile-title-username">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>@{profile?.username}</span>
            </div>
          </div>
        </div>

        <div className="profile-meta-pills">
          <div className="profile-meta-pill" title="User ID">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>
              ID: <strong>{profile?.id ? `${profile.id.substring(0, 8)}...` : '-'}</strong>
            </span>
            {profile?.id && (
              <button
                type="button"
                onClick={() => handleCopyId(profile.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 0 }}
                title="คัดลอก User ID"
              >
                {copiedId ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="profile-meta-pill" title="วันที่สร้างบัญชี">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>สร้างเมื่อ: <strong>{formatDate(profile?.createdAt)}</strong></span>
          </div>

          <div className="profile-meta-pill" title="สถานะความปลอดภัย">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
            <span>สถานะ: <strong>ออนไลน์ (Active)</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Panels */}
      <div className="profile-grid-panels">
        {/* Panel 1: ข้อมูลทั่วไป */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              ข้อมูลทั่วไป (Profile Details)
            </h2>
          </div>

          {profileMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                fontSize: '13px',
                background: profileMessage.isError ? '#fef2f2' : '#ecfdf5',
                color: profileMessage.isError ? 'var(--danger)' : 'var(--success)',
                border: `1px solid ${profileMessage.isError ? '#fecaca' : '#a7f3d0'}`
              }}
            >
              {profileMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="profileDisplayName">
                ชื่อที่แสดง (Display Name)
              </label>
              <input
                type="text"
                id="profileDisplayName"
                className="input-control"
                placeholder="เช่น แอดมินสุดหล่อ"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                required
              />
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '5px' }}>
                ชื่อนี้จะแสดงบนมุมซ้ายล่างของแถบเมนู (Sidebar) และในหน้าจัดการระบบ
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profileUsername">
                ชื่อผู้ใช้งาน (Username สำหรับเข้าสู่ระบบ)
              </label>
              <input
                type="text"
                id="profileUsername"
                className="input-control"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={64}
                required
              />
              <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '5px' }}>
                ใช้ภาษาอังกฤษตัวพิมพ์เล็กและตัวเลข ความยาว 3 ตัวอักษรขึ้นไป
              </p>
            </div>

            <button
              type="submit"
              className="btn"
              style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  </svg>
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>บันทึกข้อมูลโปรไฟล์</span>
                </>
              )}
            </button>
          </form>

          {/* Security Callout */}
          <div className="security-callout">
            <div className="security-callout-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="security-callout-content">
              <div className="security-callout-title">ข้อควรระวังขณะสตรีมสด (Live Stream)</div>
              หลีกเลี่ยงการเปิดหน้านี้ขณะที่กำลังแชร์หน้าจอหรือ Live Stream สด เพื่อป้องกันการเปิดเผยข้อมูลส่วนบุคคลหรือชื่อบัญชี
            </div>
          </div>
        </div>

        {/* Panel 2: เปลี่ยนรหัสผ่าน */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              เปลี่ยนรหัสผ่าน (Change Password)
            </h2>
          </div>

          {passwordMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                fontSize: '13px',
                background: passwordMessage.isError ? '#fef2f2' : '#ecfdf5',
                color: passwordMessage.isError ? 'var(--danger)' : 'var(--success)',
                border: `1px solid ${passwordMessage.isError ? '#fecaca' : '#a7f3d0'}`
              }}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="profileCurrentPassword">
                รหัสผ่านปัจจุบัน (Current Password)
              </label>
              <div className="input-with-action">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  id="profileCurrentPassword"
                  className="input-control"
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  aria-label={showCurrentPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showCurrentPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profileNewPassword">
                รหัสผ่านใหม่ (New Password)
              </label>
              <div className="input-with-action">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  id="profileNewPassword"
                  className="input-control"
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={4}
                  required
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowNewPass(!showNewPass)}
                  aria-label={showNewPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showNewPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              <div className="password-requirements">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>แนะนำให้ใช้อักษรผสมตัวเลขเพื่อความปลอดภัยสูงสุด</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profileConfirmPassword">
                ยืนยันรหัสผ่านใหม่ (Confirm New Password)
              </label>
              <div className="input-with-action">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  id="profileConfirmPassword"
                  className="input-control"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={4}
                  required
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  aria-label={showConfirmPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showConfirmPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
                  * รหัสผ่านใหม่ไม่ตรงกัน
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn"
              style={{
                marginTop: '8px',
                width: '100%',
                justifyContent: 'center',
                backgroundColor: 'var(--accent)'
              }}
              disabled={isSavingPassword || (confirmPassword !== '' && newPassword !== confirmPassword)}
            >
              {isSavingPassword ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  </svg>
                  <span>กำลังอัปเดตรหัสผ่าน...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>ยืนยันเปลี่ยนรหัสผ่าน</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
