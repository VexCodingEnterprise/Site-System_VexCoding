import { createClient } from '@supabase/supabase-js';
import { env, hasOfficialSupabase, officialSupabaseConfigError } from '@/lib/config';

export const supabaseAdmin = hasOfficialSupabase
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
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
