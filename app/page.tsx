import Link from 'next/link';
import React from 'react';

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
      padding: '40px 16px',
      position: 'relative',
      fontFamily: "'LINESeedSansTH', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div className="bg-mesh" />

      <div style={{
        maxWidth: '860px',
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
          <span>⚡ Next.js + TypeScript + Supabase</span>
          <span>•</span>
          <span>Serverless Realtime</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(30px, 4.5vw, 44px)',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '14px',
          color: '#0f172a',
          letterSpacing: '-0.5px'
        }}>
          ระบบโดเนทและแจ้งเตือนขึ้นจอสตรีม
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#64748b',
          maxWidth: '560px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6
        }}>
          แจ้งเตือนบน OBS ทันทีด้วย Supabase Realtime พร้อมระบบสร้าง QR พร้อมเพย์และตรวจสลิปอัตโนมัติ (Minimal Light Edition)
        </p>

        {/* 4 Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          textAlign: 'left'
        }}>
          {/* Donate Page Card */}
          <Link href="/donate" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '30px', marginBottom: '10px', textAlign: 'center' }}>🎁</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                หน้าโดเนท (Donate)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                สำหรับผู้ชมสตรีม สแกน QR พร้อมเพย์ อัปโหลดสลิป และส่งข้อความขึ้นจอ
              </p>
            </div>
          </Link>

          {/* OBS Overlay Card */}
          <Link href="/overlay" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>📺</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
                OBS Overlay
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                นำ URL หน้านี้ไปใส่ใน Browser Source ของโปรแกรม OBS / Streamlabs
              </p>
            </div>
          </Link>

          {/* Customizer Card */}
          <Link href="/customizer" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>🎨</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#7c3aed', marginBottom: '6px' }}>
                ปรับแต่งธีม (Customizer)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                ปรับแต่งหน้าตา สี ฟอนต์ แอนิเมชัน และเสียงแจ้งเตือนแบบสด ๆ
              </p>
            </div>
          </Link>

          {/* Admin Card */}
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>⚙️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#059669', marginBottom: '6px' }}>
                แดชบอร์ดแอดมิน (Admin)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                ดูยอดเงินโดเนท สถิติ ย้อนหลัง ทดสอบเสียง และจัดการคำห้าม
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
