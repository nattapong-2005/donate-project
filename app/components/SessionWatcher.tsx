'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export interface SessionWatcherProps {
  checkIntervalMs?: number;
}

export default function SessionWatcher({ checkIntervalMs = 1000 }: SessionWatcherProps) {
  const pathname = usePathname();
  const expiresAtRef = useRef<number | null>(null);
  const isKickingRef = useRef<boolean>(false);

  const kickOut = async () => {
    if (isKickingRef.current) return;
    isKickingRef.current = true;

    try {
      localStorage.removeItem('donate_admin_token');
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { }

    const targetUrl = `/login?expired=true&redirect=${encodeURIComponent(pathname || '/admin')}`;
    window.location.href = targetUrl;
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const checkSessionOnce = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.status === 401 || !res.ok) {
          kickOut();
          return;
        }

        const data = await res.json();
        if (!data.authenticated) {
          kickOut();
          return;
        }

        const expiresAt = Number(data.expiresAt || data.user?.expiresAt);
        if (!expiresAt) {
          return;
        }
        expiresAtRef.current = expiresAt;

        const nowSec = Math.floor(Date.now() / 1000);
        const remainingSec = expiresAt - nowSec;

        if (remainingSec <= 0) {
          kickOut();
          return;
        }

        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
          kickOut();
        }, remainingSec * 1000);
      } catch (err) {
        // Network error on initial check, rely on local interval if expiresAt was already known
      }
    };

    // Check once on mount / route change to obtain token expiration
    checkSessionOnce();

    // Check locally against timestamp without network requests
    intervalId = setInterval(() => {
      if (expiresAtRef.current) {
        const nowSec = Math.floor(Date.now() / 1000);
        if (nowSec >= expiresAtRef.current) {
          kickOut();
        }
      }
    }, checkIntervalMs);

    // If user returns to tab after computer sleep / idle, check local timestamp immediately
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && expiresAtRef.current) {
        const nowSec = Math.floor(Date.now() / 1000);
        if (nowSec >= expiresAtRef.current) {
          kickOut();
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (timerId) clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [pathname]);

  return null;
}

export { SessionWatcher };
