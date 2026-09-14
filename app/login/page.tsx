'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import '../donate/donate.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

      // Save token to localStorage for backward-compatible client header checks
      if (data.token) {
        localStorage.setItem('donate_admin_token', data.token);
      }

      setSuccessMessage('เข้าสู่ระบบสำเร็จ กำลังพาไปยังระบบหลังบ้าน...');

      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-mesh" />

      <div className="container" style={{ maxWidth: '420px', margin: '40px auto' }}>
        {/* Header Branding */}
        <div className="header-card" style={{ marginBottom: '24px' }}>
          <div className="avatar-wrapper" style={{ width: '74px', height: '74px', margin: '0 auto 14px' }}>
            <div
              className="avatar-img"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                background: '#eff6ff',
                borderColor: '#bfdbfe'
              }}
            >
              🔒
            </div>
            <div className="live-badge" style={{ background: '#2563eb', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)' }}>
              ADMIN
            </div>
          </div>
          <h1 className="streamer-name" style={{ fontSize: '22px' }}>
            เข้าสู่ระบบหลังบ้าน
          </h1>
          <p className="streamer-desc" style={{ fontSize: '13px' }}>
            ระบบจัดการสตรีมเมอร์ &amp; ปรับแต่งแจ้งเตือน OBS Studio
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="status-msg error" style={{ display: 'block', marginBottom: '16px' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="status-msg success" style={{ display: 'block', marginBottom: '16px' }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Login Card */}
        <div className="card" style={{ padding: '28px 24px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="form-label" htmlFor="username">
                <span>ชื่อผู้ใช้ (Username)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="username"
                  className="input-control"
                  placeholder="เช่น admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <div className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password" style={{ cursor: 'pointer' }}>รหัสผ่าน (Password)</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  {showPassword ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-control"
                placeholder="กรอกรหัสผ่านของคุณ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Initial Setup Tip */}
          <div
            style={{
              marginTop: '20px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.5
            }}
          >
            💡 <strong>ค่าเริ่มต้นระบบ:</strong> สำหรับการเข้าใช้งานครั้งแรก สามารถเข้าด้วยชื่อผู้ใช้ <code>admin</code> และรหัสผ่านที่ตั้งไว้ใน <code>ADMIN_SECRET</code> ในไฟล์ <code>.env.local</code>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="footer-nav" style={{ marginTop: '20px' }}>
          <Link href="/donate" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            กลับไปยังหน้า Donate
          </Link>
          •
          <Link href="/overlay" target="_blank">
            หน้าจอ OBS Overlay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        กำลังโหลด...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
