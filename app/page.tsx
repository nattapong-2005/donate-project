import Link from 'next/link';
import React from 'react';
import {
  HeartHandshake,
  Tv,
  Palette,
  LayoutDashboard,
  Zap,
  ArrowUpRight,
  QrCode,
  ShieldCheck,
  Radio,
  Volume2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      position: 'relative',
      fontFamily: "'LINESeedSansTH', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div className="bg-mesh" />

      <div style={{
        maxWidth: '880px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#475569',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          marginBottom: '20px'
        }}>
          <Zap size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span>Next.js + TypeScript + Supabase</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Serverless Realtime
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 4.5vw, 44px)',
          fontWeight: 800,
          lineHeight: 1.25,
          marginBottom: '14px',
          color: '#0f172a',
          letterSpacing: '-0.5px'
        }}>
          ระบบโดเนทและแจ้งเตือนขึ้นจอสตรีม
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#64748b',
          maxWidth: '580px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          แจ้งเตือนบน OBS ทันทีด้วย Supabase Realtime พร้อมระบบสร้าง QR พร้อมเพย์และตรวจสลิปอัตโนมัติ (Minimal Light Edition)
        </p>

        {/* 4 Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '18px',
          textAlign: 'left'
        }}>
          {/* Donate Page Card */}
          <Link href="/donate" style={{ textDecoration: 'none' }}>
            <div className="hub-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#fff1f2',
                  border: '1px solid #ffe4e6',
                  color: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <HeartHandshake size={24} strokeWidth={2.2} />
                </div>
                <ArrowUpRight size={18} className="hub-arrow" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                หน้าโดเนท (Donate)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                สำหรับผู้ชมสตรีม สแกน QR พร้อมเพย์ อัปโหลดสลิป และส่งข้อความขึ้นจอ
              </p>
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px dashed #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#e11d48'
              }}>
                <span>เข้าสู่หน้าโดเนท</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* OBS Overlay Card */}
          <Link href="/overlay" style={{ textDecoration: 'none' }}>
            <div className="hub-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Tv size={24} strokeWidth={2.2} />
                </div>
                <ArrowUpRight size={18} className="hub-arrow" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
                OBS Overlay
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                นำ URL หน้านี้ไปใส่ใน Browser Source ของโปรแกรม OBS / Streamlabs
              </p>
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px dashed #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563eb'
              }}>
                <span>เปิด Browser Source</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Customizer Card */}
          <Link href="/customizer" style={{ textDecoration: 'none' }}>
            <div className="hub-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#faf5ff',
                  border: '1px solid #ede9fe',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Palette size={24} strokeWidth={2.2} />
                </div>
                <ArrowUpRight size={18} className="hub-arrow" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px' }}>
                ปรับแต่งธีม (Customizer)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                ปรับแต่งหน้าตา สี ฟอนต์ แอนิเมชัน และเสียงแจ้งเตือนแบบสด ๆ
              </p>
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px dashed #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#7c3aed'
              }}>
                <span>ปรับแต่งการแสดงผล</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Admin Card */}
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div className="hub-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LayoutDashboard size={24} strokeWidth={2.2} />
                </div>
                <ArrowUpRight size={18} className="hub-arrow" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#059669', marginBottom: '6px' }}>
                แดชบอร์ดแอดมิน (Admin)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
                ดูยอดเงินโดเนท สถิติ ย้อนหลัง ทดสอบเสียง และจัดการคำห้าม
              </p>
              <div style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px dashed #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#059669'
              }}>
                <span>จัดการระบบ</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Feature Highlights with icons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '36px',
          paddingTop: '28px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div className="hub-badge-pill" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12.5px',
            color: '#475569',
            background: '#ffffff',
            padding: '7px 14px',
            borderRadius: '999px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
          }}>
            <QrCode size={15} style={{ color: '#2563eb' }} />
            <span>PromptPay QR อัตโนมัติ</span>
          </div>

          <div className="hub-badge-pill" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12.5px',
            color: '#475569',
            background: '#ffffff',
            padding: '7px 14px',
            borderRadius: '999px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
          }}>
            <ShieldCheck size={15} style={{ color: '#059669' }} />
            <span>ตรวจจับสลิปซ้ำ & สลิปปลอม</span>
          </div>

          <div className="hub-badge-pill" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12.5px',
            color: '#475569',
            background: '#ffffff',
            padding: '7px 14px',
            borderRadius: '999px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
          }}>
            <Radio size={15} style={{ color: '#7c3aed' }} />
            <span>Realtime WebSocket</span>
          </div>

          <div className="hub-badge-pill" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12.5px',
            color: '#475569',
            background: '#ffffff',
            padding: '7px 14px',
            borderRadius: '999px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
          }}>
            <Volume2 size={15} style={{ color: '#e11d48' }} />
            <span>ระบบเสียง & TTS แจ้งเตือน</span>
          </div>
        </div>
      </div>
    </div>
  );
}
