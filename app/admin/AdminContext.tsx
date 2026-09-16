'use client';

import React, { createContext, useContext } from 'react';

export interface AdminUser {
  id?: string;
  username: string;
  displayName?: string;
  role?: string;
}

export interface AdminContextType {
  showToast: (msg: string) => void;
  currentUser: AdminUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<AdminUser | null>>;
  refreshCounts: () => void;
  donationCount: number;
  blacklistCount: number;
  handleUnauthorized: () => void;
}

export const AdminContext = createContext<AdminContextType>({
  showToast: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  refreshCounts: () => {},
  donationCount: 0,
  blacklistCount: 0,
  handleUnauthorized: () => {}
});

export const useAdmin = () => useContext(AdminContext);

