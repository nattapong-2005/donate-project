'use client';

import React, { createContext, useContext } from 'react';

export interface AdminContextType {
  showToast: (msg: string) => void;
  currentUser: { username: string; displayName?: string } | null;
  refreshCounts: () => void;
  donationCount: number;
  blacklistCount: number;
  handleUnauthorized: () => void;
}

export const AdminContext = createContext<AdminContextType>({
  showToast: () => {},
  currentUser: null,
  refreshCounts: () => {},
  donationCount: 0,
  blacklistCount: 0,
  handleUnauthorized: () => {}
});

export const useAdmin = () => useContext(AdminContext);
