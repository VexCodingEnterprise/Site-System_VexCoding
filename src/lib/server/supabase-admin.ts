import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv, hasOfficialSupabase, officialSupabaseConfigError } from '@/lib/server/config';

type UntypedSupabaseClient = SupabaseClient<any, 'public', any>;

let supabaseAdmin: UntypedSupabaseClient | null = null;

export const assertOfficialMode = (): UntypedSupabaseClient => {
  if (!hasOfficialSupabase()) {
    throw new Error(officialSupabaseConfigError() || 'Supabase oficial nao configurado.');
  }

  if (!supabaseAdmin) {
    const serverEnv = getServerEnv();
    supabaseAdmin = createClient<any>(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdmin;
};
