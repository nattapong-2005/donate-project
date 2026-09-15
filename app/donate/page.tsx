'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import './donate.css';
import { PromptPayResult } from '@/lib/services/promptpay';
import { MAX_SLIP_FILE_SIZE_BYTES } from '@/lib/constants';

const PRESET_AMOUNTS = [5, 20, 50, 100, 300, 500];
const QUICK_MESSAGES = [
  'สู้ๆ นะครับ!',
  'เล่นเก่งมากเลย',
  'ค่าน้ำชา กาแฟ',
  'GG WP!'
];

export default function DonatePage() {
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('50');
  const [message, setMessage] = useState<string>('');

  // Step: 1 = Form, 2 = QR & Slip, 3 = Success
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [qrData, setQrData] = useState<PromptPayResult | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [verifiedDonation, setVerifiedDonation] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.settings) {
          setSystemSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectPreset = (val: number) => {
    setAmount(val.toString());
  };

  const handleGenerateQR = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const parsed = parseFloat(amount);
    const minVal = parseFloat(systemSettings?.min_donate) || 1;
    if (isNaN(parsed) || parsed < minVal) {
      setErrorMessage(`ยอดเงินต้องไม่ต่ำกว่า ${minVal} บาท`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/donate/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parsed })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'ไม่สามารถสร้าง QR Code ได้');
      }

      setQrData(data.data);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสร้าง QR Code');
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > MAX_SLIP_FILE_SIZE_BYTES) {
      setErrorMessage('ขนาดไฟล์ต้องไม่เกิน 4MB');
      return;
    }

    setSlipFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSlipPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    setErrorMessage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleVerifySlip = async () => {
    setErrorMessage('');
    if (!slipFile) {
      setErrorMessage('กรุณาอัปโหลดรูปภาพสลิปการโอนเงิน');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('slip', slipFile);
      formData.append('name', name || 'ผู้สนับสนุนใจดี');
      formData.append('amount', amount);
      formData.append('message', message);

      const res = await fetch('/api/donate/verify-slip', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'การตรวจสอบสลิปล้มเหลว');
      }

      setVerifiedDonation(data.data);
      setStep(3);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setQrData(null);
    setSlipFile(null);
    setSlipPreview(null);
    setMessage('');
    setErrorMessage('');
    setVerifiedDonation(null);
  };

  return (
    <div>
      <div className="bg-mesh" />

      <div className="container">
        {/* Streamer Profile Header */}
        <div className="header-card">
          {/* <div className="avatar-wrapper">
            <div className="avatar-img">
              🎮
            </div>
            <div className="live-badge">
              <span className="live-dot"></span> LIVE
            </div>
          </div> */}
          <h1 className="streamer-name">
            {systemSettings?.receiver_name || 'localhostvlr'}
          </h1>
          <p className="streamer-desc">
            ส่งกำลังใจและข้อความขึ้นจอสดระหว่างสตรีมได้ที่นี่
          </p>
        </div>

        {/* Status / Error Notification */}
        {errorMessage && (
          <div className="status-msg error" style={{ display: 'block' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Step 1: Donation Form */}
        {step === 1 && (
          <div className="card">
            <div className="form-group">
              <label className="form-label" htmlFor="nameInput">
                <span>ชื่อผู้สนับสนุน</span>
                <span className="label-hint">ไม่ระบุ = ผู้สนับสนุนใจดี</span>
              </label>
              <input
                type="text"
                id="nameInput"
                className="input-control"
                placeholder="ใส่ชื่อหรือฉายาของคุณ"
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>จำนวนเงินสนับสนุน (บาท)</span>
                <span className="label-hint">ขั้นต่ำ {systemSettings?.min_donate || 1} บาท</span>
              </label>
              <div className="amount-grid">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`amount-btn ${parseFloat(amount) === val ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(val)}
                  >
                    {val} <span className="currency-badge">฿</span>
                  </button>
                ))}
              </div>
              <input
                type="number"
                id="amountInput"
                className="input-control"
                value={amount}
                min={systemSettings?.min_donate || 1}
                step="any"
                placeholder={`หรือระบุจำนวนเงินเอง (ขั้นต่ำ ${systemSettings?.min_donate || 1} บาท)`}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="messageInput">
                <span>ข้อความขึ้นจอ</span>
                <span className="label-hint">{message.length}/200</span>
              </label>
              <textarea
                id="messageInput"
                className="input-control"
                placeholder="พิมพ์ข้อความที่ต้องการให้แสดงบนหน้าจอสตีม..."
                maxLength={200}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="chips-row">
                {QUICK_MESSAGES.map((msg) => (
                  <button
                    key={msg}
                    type="button"
                    className="chip-btn"
                    onClick={() => setMessage(msg)}
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => handleGenerateQR()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>กำลังสร้าง QR...</span>
                </>
              ) : (
                <>
                  <span>สร้าง QR Code ชำระเงิน</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Payment & Slip Upload */}
        {step === 2 && (
          <div className="card payment-section active">
            <div className="qr-box">
              <svg className="promptpay-logo" viewBox="0 0 400 135" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="135" rx="12" fill="#002D62"/>
                <text x="200" y="75" fontFamily="'LINESeedSansTH', sans-serif" fontSize="40" fontWeight="bold" fill="#ffffff" textAnchor="middle">PromptPay</text>
                <text x="200" y="108" fontFamily="'LINESeedSansTH', sans-serif" fontSize="20" fill="#f8fafc" textAnchor="middle">พร้อมเพย์</text>
              </svg>
              {(qrData?.qrImage || qrData?.qrDataUrl) && (
                <img src={qrData.qrImage || qrData.qrDataUrl} alt="PromptPay QR Code" className="qr-image" />
              )}
              <div className="qr-amount-tag">
                ฿{(parseFloat(amount) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="qr-instructions">
              <p>สแกน QR ผ่านแอปธนาคารใดก็ได้เพื่อชำระเงิน</p>
              {qrData?.promptpayId && (
                <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  หมายเลขพร้อมเพย์: {qrData.promptpayId}
                </p>
              )}
            </div>

            {/* File Upload / Dropzone */}
            {!slipPreview ? (
              <div
                className={`dropzone ${isDragOver ? 'dragover' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="dropzone-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div className="dropzone-text">แตะเพื่อเลือกสลิป หรือลากไฟล์มาวางที่นี่</div>
                <div className="dropzone-sub">รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 4MB</div>
              </div>
            ) : (
              <div className="preview-container" style={{ display: 'block' }}>
                <img src={slipPreview} alt="Slip Preview" className="preview-img" />
                <div>
                  <span className="change-file-btn" onClick={() => fileInputRef.current?.click()}>
                    เปลี่ยนรูปภาพสลิป
                  </span>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="file-input"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />

            <button
              type="button"
              className="btn-primary"
              disabled={isLoading || !slipFile}
              onClick={handleVerifySlip}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  <span>กำลังตรวจสอบสลิป...</span>
                </>
              ) : (
                <>
                  <span>ตรวจสอบการชำระเงิน</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                width: '100%',
                marginTop: '14px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              ย้อนกลับไปแก้ไขข้อมูล
            </button>
          </div>
        )}

        {/* Step 3: Success Receipt */}
        {step === 3 && (
          <div className="card success-card" style={{ display: 'block' }}>
            <div className="success-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>ขอบคุณสำหรับการสนับสนุน</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              ข้อความของคุณถูกส่งขึ้นหน้าจอสตีม OBS เรียบร้อยแล้ว
            </p>

            <div className="receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">ผู้สนับสนุน:</span>
                <span className="receipt-value">{verifiedDonation?.name || name || 'ผู้สนับสนุนใจดี'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">ยอดเงิน:</span>
                <span className="receipt-value" style={{ color: 'var(--success)', fontWeight: 700 }}>
                  ฿{(parseFloat(amount) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">ข้อความ:</span>
                <span className="receipt-value">{message || '-'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">รหัสอ้างอิง:</span>
                <span className="receipt-value" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                  {verifiedDonation?.trans_ref || 'SIMULATED-' + Date.now()}
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">เวลาที่ยืนยัน:</span>
                <span className="receipt-value">{new Date().toLocaleTimeString('th-TH')}</span>
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={handleReset}>
              <span>สนับสนุนอีกครั้ง</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="footer-nav">
          <Link href="/overlay" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            หน้าจอ OBS Overlay
          </Link>
          •
          <Link href="/admin">
            เข้าสู่ระบบ Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
