'use client';

import { createClient } from '@supabase/supabase-js';
import { publicEnv } from '@/lib/config';

let browserClient: ReturnType<typeof createClient> | null = null;
export const hasBrowserSupabaseConfig = Boolean(publicEnv.supabaseUrl) && Boolean(publicEnv.supabaseAnonKey);

export function getBrowserSupabase() {
  if (!hasBrowserSupabaseConfig) {
    throw new Error('Supabase publico nao configurado.');
  }

  if (!browserClient) {
    browserClient = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
  }

  return browserClient;
}
