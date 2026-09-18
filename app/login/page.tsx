'use client';

import React, { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import '../donate/donate.css';
import './login.css';

interface FormErrors {
  username?: string;
  password?: string;
}

const validateUsername = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'กรุณากรอกชื่อผู้ใช้';
  }
  if (value.includes(' ')) {
    return 'ชื่อผู้ใช้ต้องไม่มีการเว้นวรรค';
  }
  if (trimmed.length < 3) {
    return 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
  }
  if (trimmed.length > 30) {
    return 'ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 30 ตัวอักษร';
  }
  const validPattern = /^[a-zA-Z0-9_.-]+$/;
  if (!validPattern.test(trimmed)) {
    return 'ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ . - เท่านั้น';
  }
  return '';
};

const validatePassword = (value: string): string => {
  if (!value) {
    return 'กรุณากรอกรหัสผ่าน';
  }
  if (value.length < 4) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร';
  }
  if (value.length > 100) {
    return 'รหัสผ่านต้องมีความยาวไม่เกิน 100 ตัวอักษร';
  }
  return '';
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    if (errorMessage) setErrorMessage('');
    if (hasSubmitted) {
      setErrors(prev => ({ ...prev, username: validateUsername(val) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (errorMessage) setErrorMessage('');
    if (hasSubmitted) {
      setErrors(prev => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setHasSubmitted(true);

    const userErr = validateUsername(username);
    const passErr = validatePassword(password);

    setErrors({ username: userErr, password: passErr });

    if (userErr) {
      usernameRef.current?.focus();
      return;
    }
    if (passErr) {
      passwordRef.current?.focus();
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
    <div className="login-page-wrapper">
      <div className="bg-mesh" />

      <div className="login-container">
        {/* Header Branding */}
        <div className="login-header">
          <div className="login-avatar-wrapper">
            <div className="login-avatar-img">
              🔒
            </div>
            <div className="login-badge">
              ADMIN
            </div>
          </div>
          <h1 className="login-title">
            เข้าสู่ระบบหลังบ้าน
          </h1>
          <p className="login-desc">
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
        <div className="login-card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label" htmlFor="username">
                  <span>ชื่อผู้ใช้ (Username)</span>
                </label>
                {hasSubmitted && !errors.username && username.trim() && (
                  <span className="login-valid-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ถูกต้อง
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  ref={usernameRef}
                  type="text"
                  id="username"
                  className={`login-input ${hasSubmitted && errors.username ? 'input-error' : ''}`}
                  placeholder="เช่น admin"
                  value={username}
                  onChange={handleUsernameChange}
                  autoComplete="username"
                  autoFocus
                  aria-invalid={Boolean(hasSubmitted && errors.username)}
                  aria-describedby={hasSubmitted && errors.username ? 'username-error' : undefined}
                />
              </div>
              {hasSubmitted && errors.username && (
                <div
                  id="username-error"
                  role="alert"
                  className="login-error-text"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            <div className="login-form-group">
              <div className="login-label-row">
                <label className="login-label" htmlFor="password">รหัสผ่าน (Password)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasSubmitted && !errors.password && password && (
                    <span className="login-valid-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      ถูกต้อง
                    </span>
                  )}
                  <button
                    type="button"
                    className="login-toggle-pw-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`login-input ${hasSubmitted && errors.password ? 'input-error' : ''}`}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  aria-invalid={Boolean(hasSubmitted && errors.password)}
                  aria-describedby={hasSubmitted && errors.password ? 'password-error' : undefined}
                />
              </div>
              {hasSubmitted && errors.password && (
                <div
                  id="password-error"
                  role="alert"
                  className="login-error-text"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="login-btn-submit"
              disabled={isLoading}
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
        </div>

        {/* Footer Navigation */}
        <div className="login-footer-nav">
          <Link href="/">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            กลับไปยังหน้า Donate (/)
          </Link>
          <span>•</span>
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
