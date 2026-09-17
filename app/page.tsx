'use client';

import React, { useState, useEffect, useRef } from 'react';
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

interface ModalAlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

export default function DonatePage() {
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('5');
  const [message, setMessage] = useState<string>('');

  // Step: 1 = Form, 2 = QR & Slip, 3 = Success
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal Alert state
  const [modalAlert, setModalAlert] = useState<ModalAlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning'
  });

  const [qrData, setQrData] = useState<PromptPayResult | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [verifiedDonation, setVerifiedDonation] = useState<any>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedPromptPay, setCopiedPromptPay] = useState<boolean>(false);
  const [downloadingQR, setDownloadingQR] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'truemoney'>('promptpay');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showAlert = (
    msg: string,
    title: string = 'แจ้งเตือน',
    type: 'error' | 'warning' | 'info' | 'success' = 'warning'
  ) => {
    setModalAlert({
      isOpen: true,
      title,
      message: msg,
      type
    });
  };

  const handleSelectMethod = (method: 'promptpay' | 'truemoney') => {
    if (method === 'truemoney') {
      showAlert(
        'ช่องทางการชำระเงินผ่าน TrueMoney Wallet กำลังอยู่ระหว่างการพัฒนาและรอการอัปเดตระบบเร็วๆ นี้ครับ กรุณาใช้พร้อมเพย์ (PromptPay) เพื่อทำรายการในขณะนี้',
        'TrueMoney Wallet (รอการอัปเดต)',
        'info'
      );
      return;
    }
    setPaymentMethod(method);
  };

  const closeAlert = () => {
    setModalAlert((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseQrModal = () => {
    setIsQrModalOpen(false);
    if (step === 3) {
      handleReset();
    }
  };

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalAlert.isOpen) {
          closeAlert();
        } else if (isQrModalOpen) {
          handleCloseQrModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalAlert.isOpen, isQrModalOpen, step]);

  // Prevent background scrolling when QR modal is open
  useEffect(() => {
    if (isQrModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isQrModalOpen]);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSystemSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectPreset = (val: number) => {
    setAmount(val.toString());
  };

  const handleCopyPromptPay = async () => {
    if (!qrData?.promptpayId) return;
    try {
      await navigator.clipboard.writeText(qrData.promptpayId);
      setCopiedPromptPay(true);
      setTimeout(() => setCopiedPromptPay(false), 2000);
    } catch (err) {
      showAlert('ไม่สามารถคัดลอกได้อัตโนมัติ กรุณากดคัดลอกหมายเลขด้วยตนเอง', 'คัดลอกไม่สำเร็จ', 'info');
    }
  };

  const handleDownloadQR = () => {
    const url = qrData?.qrImage || qrData?.qrDataUrl;
    if (!url) return;
    try {
      setDownloadingQR(true);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptpay-qr-${amount || 'donate'}thb.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => setDownloadingQR(false), 1500);
    } catch (err) {
      setDownloadingQR(false);
      showAlert('หากดาวน์โหลดอัตโนมัติไม่สำเร็จ สามารถกดค้างที่รูปภาพ QR เพื่อบันทึกภาพได้ครับ', 'บันทึกรูป QR', 'info');
    }
  };

  const handleGenerateQR = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const parsed = parseFloat(amount);
    const minVal = parseFloat(systemSettings?.min_donate) || 1;
    if (isNaN(parsed) || parsed < minVal) {
      showAlert(`ยอดเงินต้องไม่ต่ำกว่า ${minVal} บาท`, 'ยอดเงินไม่ถูกต้อง', 'warning');
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
      setIsQrModalOpen(true);
    } catch (err: any) {
      showAlert(err.message || 'เกิดข้อผิดพลาดในการสร้าง QR Code', 'สร้าง QR ไม่สำเร็จ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showAlert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (รองรับ JPG, PNG, WEBP)', 'รูปแบบไฟล์ไม่ถูกต้อง', 'warning');
      return;
    }

    if (file.size > MAX_SLIP_FILE_SIZE_BYTES) {
      showAlert('ขนาดไฟล์รูปภาพสลิปต้องไม่เกิน 4MB', 'ขนาดไฟล์ใหญ่เกินไป', 'warning');
      return;
    }

    setSlipFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSlipPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
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
    if (!slipFile) {
      showAlert('กรุณาอัปโหลดรูปภาพสลิปการโอนเงินก่อนกดยืนยัน', 'ยังไม่ได้แนบสลิป', 'warning');
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
      showAlert(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป', 'ตรวจสอบสลิปไม่สำเร็จ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSlip = () => {
    setSlipFile(null);
    setSlipPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setStep(1);
    setIsQrModalOpen(false);
    setQrData(null);
    setSlipFile(null);
    setSlipPreview(null);
    setMessage('');
    setVerifiedDonation(null);
    setCopiedPromptPay(false);
    setDownloadingQR(false);
    closeAlert();
  };

  return (
    <div>
      <div className="bg-mesh" />

      <div className="container">
        {/* Streamer Profile Header */}
        <div className="header-card">
          <h1 className="streamer-name text-2xl">
            localhostvlr
          </h1>
          <p className="streamer-desc">
            ส่งกำลังใจและข้อความขึ้นจอสดระหว่างสตรีมได้ที่นี่
          </p>
        </div>

        {/* Step 1: Donation Form (Always Visible) */}
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

            {/* Payment Method Selector */}
            <div className="form-group">
              <label className="form-label" id="payment-method-label">
                <span>ช่องทางชำระเงิน</span>
              </label>
              <div
                className="payment-method-grid"
                role="radiogroup"
                aria-labelledby="payment-method-label"
              >
                {/* PromptPay */}
                <div
                  className={`payment-method-card ${paymentMethod === 'promptpay' ? 'active' : ''}`}
                  onClick={() => handleSelectMethod('promptpay')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectMethod('promptpay');
                    }
                  }}
                  role="radio"
                  aria-checked={paymentMethod === 'promptpay'}
                  tabIndex={0}
                  title="พร้อมเพย์: สแกน QR ได้ทุกแอปธนาคาร ฟรีค่าธรรมเนียม"
                >
                  <div className="pm-icon-wrap pp">
                    <svg className="pm-logo" viewBox="0 0 400 135" xmlns="http://www.w3.org/2000/svg">
                      <rect width="400" height="135" rx="14" fill="#002D62" />
                      <text x="200" y="75" fontFamily="'LINESeedSansTH', sans-serif" fontSize="42" fontWeight="bold" fill="#ffffff" textAnchor="middle">PromptPay</text>
                      <text x="200" y="108" fontFamily="'LINESeedSansTH', sans-serif" fontSize="22" fill="#f8fafc" textAnchor="middle">พร้อมเพย์</text>
                    </svg>
                  </div>
                  <div className="pm-info">
                    <span className="pm-title">พร้อมเพย์</span>
                    <span className="pm-status-badge active">
                      <span className="badge-dot"></span>
                      พร้อมใช้งาน
                    </span>
                  </div>
                  <div className="pm-radio" aria-hidden="true">
                    <span className="pm-radio-inner"></span>
                  </div>
                </div>

                {/* TrueMoney Wallet */}
                <div
                  className="payment-method-card disabled tm-card"
                  onClick={() => handleSelectMethod('truemoney')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectMethod('truemoney');
                    }
                  }}
                  role="radio"
                  aria-checked={false}
                  aria-disabled="true"
                  tabIndex={0}
                  title="TrueMoney Wallet กำลังอยู่ระหว่างรอการอัปเดต"
                >
                  <div className="pm-icon-wrap tm">
                    <svg className="pm-logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <rect width="100" height="100" rx="20" fill="#f95b00" />
                      <text x="50" y="52" fontFamily="'LINESeedSansTH', sans-serif" fontSize="22" fontWeight="900" fill="#ffffff" textAnchor="middle">true</text>
                      <text x="50" y="74" fontFamily="'LINESeedSansTH', sans-serif" fontSize="16" fontWeight="bold" fill="#ffffff" textAnchor="middle">money</text>
                    </svg>
                  </div>
                  <div className="pm-info">
                    <span className="pm-title">TrueMoney</span>
                    <span className="pm-status-badge upcoming">
                      <span className="badge-dot upcoming"></span>
                      รอการอัปเดต
                    </span>
                  </div>
                  <div className="pm-lock-icon" aria-hidden="true" title="ยังไม่เปิดให้บริการ">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </div>
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
        </div>

        {/* Step 2 & 3: QR Code Payment & Slip Verification Modal */}
        {isQrModalOpen && (
          <div
            className="qr-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseQrModal();
            }}
            role="dialog"
            aria-modal="true"
            aria-label={step === 3 ? 'ขอบคุณสำหรับการสนับสนุน' : 'สแกน QR Code เพื่อชำระเงิน'}
          >
            <div className={`qr-modal-container ${step === 3 ? 'step-3-modal' : ''}`}>
              {/* Close Button */}
              <button
                type="button"
                className="qr-modal-close-btn"
                onClick={handleCloseQrModal}
                aria-label="ปิดหน้าต่าง"
                title="ปิดหน้าต่าง (Esc)"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Step 2: Payment & Slip Upload */}
              {step === 2 && (
                <div className="payment-section active in-modal">
                  {/* Step Header & Donor Summary Pill */}
                  <div className="step-2-header">
                    <div className="step-badge">
                      <span className="step-badge-dot"></span>
                      <span>สแกนชำระเงินและแนบสลิป</span>
                    </div>
                    <div className="donor-summary-pill">
                      <span className="donor-name-tag">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {name ? name : 'ผู้สนับสนุนใจดี'}
                      </span>
                      <span className="summary-pill-divider">•</span>
                      <span className="donor-amount-tag">
                        ฿{(parseFloat(amount) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Payment Channel Tabs */}
                  <div className="payment-channel-tabs">
                    <div className="channel-tab active">
                      <span className="channel-tab-dot"></span>
                      <span>พร้อมเพย์ (PromptPay)</span>
                    </div>
                    <div
                      className="channel-tab disabled"
                      onClick={() => handleSelectMethod('truemoney')}
                      title="TrueMoney Wallet กำลังอยู่ระหว่างรอการอัปเดต"
                    >
                      <span className="channel-tab-name">TrueMoney Wallet</span>
                      <span className="channel-tab-badge">รออัปเดต</span>
                    </div>
                  </div>

                  {/* Responsive Grid */}
                  <div className="payment-grid">
                    {/* Left Column: QR Code & Quick Actions */}
                    <div className="payment-col-qr">
                      <div className="qr-box">
                        <svg className="promptpay-logo" viewBox="0 0 400 135" xmlns="http://www.w3.org/2000/svg">
                          <rect width="400" height="135" rx="12" fill="#002D62" />
                          <text x="200" y="75" fontFamily="'LINESeedSansTH', sans-serif" fontSize="40" fontWeight="bold" fill="#ffffff" textAnchor="middle">PromptPay</text>
                          <text x="200" y="108" fontFamily="'LINESeedSansTH', sans-serif" fontSize="20" fill="#f8fafc" textAnchor="middle">พร้อมเพย์</text>
                        </svg>
                        {(qrData?.qrImage || qrData?.qrDataUrl) && (
                          <div className="qr-image-wrapper">
                            <img src={qrData.qrImage || qrData.qrDataUrl} alt="PromptPay QR Code" className="qr-image" />
                          </div>
                        )}
                        <div className="qr-amount-tag">
                          ฿{(parseFloat(amount) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Quick Action Buttons: Download QR & Copy PromptPay */}
                      <div className="qr-action-row">
                        <button
                          type="button"
                          className={`qr-action-btn ${downloadingQR ? 'success' : ''}`}
                          onClick={handleDownloadQR}
                          title="บันทึกรูปภาพ QR Code ลงเครื่อง"
                        >
                          {downloadingQR ? (
                            <>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>บันทึกแล้ว!</span>
                            </>
                          ) : (
                            <>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              <span>บันทึกรูป QR</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          className={`qr-action-btn ${copiedPromptPay ? 'success' : ''}`}
                          onClick={handleCopyPromptPay}
                          title="คัดลอกหมายเลขพร้อมเพย์"
                        >
                          {copiedPromptPay ? (
                            <>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>คัดลอกแล้ว!</span>
                            </>
                          ) : (
                            <>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              <span>คัดลอกพร้อมเพย์</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="qr-guide-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <p>เปิดแอปธนาคารใดก็ได้ แล้วสแกนเพื่อโอนเงินตามยอดที่ระบุ</p>
                      </div>
                    </div>

                    {/* Right Column: Donor Review Card & Slip Upload */}
                    <div className="payment-col-upload">
                      <div className="donor-review-card">
                        <div className="review-item">
                          <span className="review-label">ผู้สนับสนุน:</span>
                          <span className="review-val">{name || 'ผู้สนับสนุนใจดี'}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">ยอดโอนเงิน:</span>
                          <span className="review-val highlight">
                            ฿{(parseFloat(amount) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {message && (
                          <div className="review-message-box">
                            <span className="review-msg-label">ข้อความขึ้นจอ:</span>
                            <p className="review-msg-text">“{message}”</p>
                          </div>
                        )}
                      </div>

                      {/* File Upload / Dropzone */}
                      <div className="upload-section-title">
                        <span>แนบหลักฐานการโอนเงิน (สลิป)</span>
                        <span className="required-star">*</span>
                      </div>

                      {!slipPreview ? (
                        <div
                          className={`dropzone ${isDragOver ? 'dragover' : ''}`}
                          onClick={() => fileInputRef.current?.click()}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          <div className="dropzone-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          </div>
                          <div className="dropzone-text">แตะเพื่อเลือกสลิป หรือลากไฟล์มาวาง</div>
                          <div className="dropzone-sub">รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 4MB</div>
                        </div>
                      ) : (
                        <div className="preview-card">
                          <div className="preview-img-wrapper">
                            <img src={slipPreview} alt="Slip Preview" className="preview-img" />
                          </div>
                          <div className="preview-meta">
                            <div className="slip-name" title={slipFile?.name}>
                              {slipFile?.name}
                            </div>
                            <div className="slip-size">
                              {slipFile ? `${(slipFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                            </div>
                            <div className="preview-actions">
                              <button
                                type="button"
                                className="preview-btn change"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                                </svg>
                                เปลี่ยนรูป
                              </button>
                              <button
                                type="button"
                                className="preview-btn remove"
                                onClick={handleRemoveSlip}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                ลบรูป
                              </button>
                            </div>
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
                        className="btn-primary btn-verify"
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
                        className="btn-back-step"
                        onClick={handleCloseQrModal}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="19" y1="12" x2="5" y2="12"></line>
                          <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        ย้อนกลับไปแก้ไขข้อมูล
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Success Receipt inside Modal */}
              {step === 3 && (
                <div className="success-card in-modal" style={{ display: 'block' }}>
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

                  <div className="modal-success-actions">
                    <button type="button" className="btn-primary" onClick={handleReset}>
                      <span>สนับสนุนอีกครั้ง</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                    </button>
                    <button type="button" className="btn-secondary-modal" onClick={handleCloseQrModal}>
                      ปิดหน้าต่าง
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Modal Alert */}
      {modalAlert.isOpen && (
        <div
          className="modal-alert-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAlert();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-alert-box">
            <div className={`modal-alert-icon-wrap ${modalAlert.type}`}>
              {modalAlert.type === 'error' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              )}
              {modalAlert.type === 'warning' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              )}
              {modalAlert.type === 'success' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
              {modalAlert.type === 'info' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              )}
            </div>

            <h3 className="modal-alert-title">{modalAlert.title}</h3>
            <p className="modal-alert-message">{modalAlert.message}</p>

            <button
              type="button"
              className="modal-alert-btn"
              onClick={closeAlert}
              autoFocus
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
