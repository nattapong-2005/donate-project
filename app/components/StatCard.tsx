'use client';

import React from 'react';

export interface StatCardProps {
  icon: React.ReactNode;
  iconVariant?: 'blue' | 'purple' | 'orange' | 'green' | 'default';
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export default function StatCard({
  icon,
  iconVariant = 'default',
  title,
  value,
  subtitle,
  className = ''
}: StatCardProps) {
  const variantClass = iconVariant && iconVariant !== 'default' ? iconVariant : '';
  return (
    <div className={`stat-card ${className}`}>
      <div className={`stat-icon ${variantClass}`}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="stat-val">{value}</div>
        {subtitle && <div className="stat-sub">{subtitle}</div>}
      </div>
    </div>
  );
}
