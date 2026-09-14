'use client';

import React from 'react';

export interface MobileTopBarProps {
  onOpenSidebar: () => void;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export default function MobileTopBar({
  onOpenSidebar,
  title = 'Streamer Admin',
  subtitle = 'จัดการระบบโดเนท & สตรีม',
  badge,
  rightAction
}: MobileTopBarProps) {
  return (
    <div className="mobile-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          className="hamburger-btn"
          onClick={onOpenSidebar}
          aria-label="เปิดเมนู"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{title}</span>
            {badge}
          </div>
          {subtitle && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}
