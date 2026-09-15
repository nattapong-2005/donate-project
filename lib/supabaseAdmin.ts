import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vzzoytgbthaqoaoodkdo.supabase.co';
const supabaseUrl: string = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseServiceRoleKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
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
