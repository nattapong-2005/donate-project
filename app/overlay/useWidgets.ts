'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { WidgetData } from '@/lib/widgets';

export function useWidgets() {
  const [data, setData] = useState<WidgetData | null>(null);
  useEffect(() => {
    document.body.classList.add('widget-overlay-body');
    let disposed = false;
    let running = false;
    let queued = false;
    const controller = new AbortController();
    const refresh = async () => {
      if (disposed) return;
      if (running) { queued = true; return; }
      running = true;
      try {
        const response = await fetch('/api/widgets', { cache: 'no-store', signal: controller.signal });
        const result = await response.json();
        if (!disposed && response.ok && result.success) setData(result.data);
      } catch (error) {
        if (!disposed) console.warn('Widget refresh failed:', error);
      } finally {
        running = false;
        if (queued && !disposed) { queued = false; void refresh(); }
      }
    };
    const channel = supabase.channel('donation-alerts')
      .on('broadcast', { event: 'donation' }, ({ payload }) => { if (!payload?.isTest && !payload?.isReplay) void refresh(); })
      .on('broadcast', { event: 'settings_updated' }, () => void refresh())
      .subscribe();
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    return () => { disposed = true; controller.abort(); clearInterval(timer); void supabase.removeChannel(channel); document.body.classList.remove('widget-overlay-body'); };
  }, []);
  return data;
}
