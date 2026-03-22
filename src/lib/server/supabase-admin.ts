import { createClient } from '@supabase/supabase-js';
import { env, hasOfficialSupabase } from '@/lib/config';

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
    throw new Error('Supabase oficial nao configurado. Preencha as variaveis de ambiente do modo oficial.');
  }

  return supabaseAdmin;
};
