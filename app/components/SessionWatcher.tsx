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
    let heartbeatId: NodeJS.Timeout | null = null;

    const checkSession = async () => {
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
          // If no expiration timestamp is provided but authenticated is true, do not kick out
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
        // Allow next interval to retry if transient network error
      }
    };

    checkSession();

    intervalId = setInterval(() => {
      if (expiresAtRef.current) {
        const nowSec = Math.floor(Date.now() / 1000);
        if (nowSec >= expiresAtRef.current) {
          kickOut();
        }
      }
    }, checkIntervalMs);

    heartbeatId = setInterval(() => {
      checkSession();
    }, 8000);

    return () => {
      if (timerId) clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
      if (heartbeatId) clearInterval(heartbeatId);
    };
  }, [pathname]);

  return null;
}

export { SessionWatcher };
