import { createClient } from '@supabase/supabase-js';
import { hasOfficialSupabase, officialSupabaseConfigError, serverEnv } from '@/lib/server/config';

export const supabaseAdmin = hasOfficialSupabase
  ? createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export const assertOfficialMode = () => {
  if (!supabaseAdmin) {
    throw new Error(officialSupabaseConfigError() || 'Supabase oficial nao configurado.');
  }

  return supabaseAdmin;
};
