'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarUser {
  id?: string;
  username: string;
  displayName?: string;
  role?: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  donationCount?: number;
  blacklistCount?: number;
  currentUser?: SidebarUser | null;
  onLogout?: () => void;
  brandTitle?: string;
  brandHref?: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  donationCount = 0,
  blacklistCount = 0,
  currentUser,
  onLogout,
  brandTitle = 'Streamer Admin',
  brandHref = '/admin'
}: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = (tabKey?: string) => {
    if (onTabChange && tabKey) {
      onTabChange(tabKey);
    }
    onClose();
  };

  const isOverviewActive = pathname === '/admin' || (!activeTab && pathname === '/admin') || activeTab === 'tabOverview';
  const isAnalyticsActive = pathname?.startsWith('/admin/analytics') || activeTab === 'tabAnalytics';
  const isDonationsActive = pathname?.startsWith('/admin/donations') || activeTab === 'tabDonations';
  const isSettingsActive = pathname?.startsWith('/admin/settings') || activeTab === 'tabSettings';
  const isWidgetsActive = pathname?.startsWith('/admin/widgets') || activeTab === 'tabWidgets';
  const isBlacklistActive = pathname?.startsWith('/admin/blacklist') || activeTab === 'tabBlacklist';
  const isProfileActive = pathname?.startsWith('/admin/profile') || activeTab === 'tabProfile';
  const isCustomizerActive = pathname?.startsWith('/customizer') || activeTab === 'tabCustomizer';

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href={brandHref} className="sidebar-brand" onClick={() => onClose()}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
              <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"></path>
            </svg>
            <span>{brandTitle}</span>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="ปิดเมนู"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sidebar-nav">
          <div>
            <div className="sidebar-section-title">เมนูจัดการระบบ</div>
            <ul className="sidebar-menu">
              <li>
                <Link
                  href="/admin"
                  className={`sidebar-link ${isOverviewActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick('tabOverview')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                  </svg>
                  <span>หน้าหลัก</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/analytics"
                  className={`sidebar-link ${isAnalyticsActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick('tabAnalytics')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  <span>สถิติเชิงลึก</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/donations"
                  className={`sidebar-link ${isDonationsActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick('tabDonations')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  <span>ประวัติการโดเนท</span>
                  {donationCount > 0 && <span className="sidebar-badge">{donationCount}</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  className={`sidebar-link ${isSettingsActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick('tabSettings')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                  <span>ตั้งค่าระบบ & OBS</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/widgets"
                  className={`sidebar-link ${isWidgetsActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick('tabWidgets')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  </svg>
                  <span>วิดเจ็ต OBS & เป้าหมาย</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/blacklist"
                  className={`sidebar-link ${isBlacklistActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick('tabBlacklist')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>กรองคำหยาบ</span>
                  {blacklistCount > 0 && <span className="sidebar-badge">{blacklistCount}</span>}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/profile"
                  className={`sidebar-link ${isProfileActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick('tabProfile')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>จัดการโปรไฟล์</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="sidebar-section-title">จอสตรีม & ลิงก์ภายนอก</div>
            <ul className="sidebar-menu">
              <li>
                <Link
                  href="/customizer"
                  className={`sidebar-link ${isCustomizerActive ? 'active' : ''}`}
                  onClick={() => handleLinkClick('tabCustomizer')}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                  <span>ปรับแต่ง UI Donate</span>
                </Link>
              </li>
              <li>
                <Link href="/overlay" target="_blank" className="sidebar-link" onClick={onClose}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  <span>ทดสอบ Overlay</span>
                </Link>
              </li>
              <li>
                <Link href="/" target="_blank" className="sidebar-link" onClick={onClose}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  <span>หน้าบริจาค Donate (/)</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          {currentUser && (
            <Link
              href="/admin/profile"
              className={`sidebar-user-card ${isProfileActive ? 'active' : ''}`}
              onClick={() => onClose()}
              title="คลิกเพื่อจัดการโปรไฟล์"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <div className="sidebar-user-avatar">
                {(currentUser.displayName || currentUser.username || 'A')[0].toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{currentUser.displayName || currentUser.username}</div>
                <div className="sidebar-user-role">ผู้ดูแลระบบ (Admin)</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          )}

          <div className="sidebar-footer-actions">
            {onLogout && (
              <button
                type="button"
                className="sidebar-action-btn logout"
                onClick={onLogout}
                title="ออกจากระบบ"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>ออกจากระบบ</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
