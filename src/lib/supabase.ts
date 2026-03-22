'use client';

import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/config';

let browserClient: ReturnType<typeof createClient> | null = null;
export const hasBrowserSupabaseConfig = Boolean(env.supabaseUrl) && Boolean(env.supabaseAnonKey);

export function getBrowserSupabase() {
  if (!hasBrowserSupabaseConfig) {
    throw new Error('Supabase publico nao configurado.');
  }

  if (!browserClient) {
    browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return browserClient;
}
