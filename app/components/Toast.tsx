'use client';

import React from 'react';

export interface ToastProps {
  message: string | null;
  className?: string;
}

export default function Toast({ message, className = '' }: ToastProps) {
  if (!message) return null;

  return (
    <div
      className={`admin-toast ${className}`}
      style={{ display: 'block' }}
      role="alert"
    >
      {message}
    </div>
  );
}
