import { createClient } from '@supabase/supabase-js';
import { getServerEnv, hasOfficialSupabase, officialSupabaseConfigError } from '@/lib/server/config';

let supabaseAdmin:
  | ReturnType<typeof createClient>
  | null = null;

export const assertOfficialMode = () => {
  if (!hasOfficialSupabase()) {
    throw new Error(officialSupabaseConfigError() || 'Supabase oficial nao configurado.');
  }

  if (!supabaseAdmin) {
    const serverEnv = getServerEnv();
    supabaseAdmin = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdmin;
};
