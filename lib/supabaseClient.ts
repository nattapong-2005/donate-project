import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzzoytgbthaqoaoodkdo.supabase.co';
const supabaseUrl: string = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        cache: 'no-store'
      });
    }
  }
});
