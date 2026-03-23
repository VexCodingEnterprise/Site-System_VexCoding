import 'server-only';

import { isPlaceholderValue, isValidSupabaseUrl, publicEnv } from '@/lib/config';

export const serverEnv = {
  ...publicEnv,
  supabaseServiceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
  resendApiKey: (process.env.RESEND_API_KEY || '').trim(),
  sessionSecret: (process.env.SESSION_SECRET || 'vexcoding-dev-session-secret').trim(),
};

export const getMissingOfficialSupabaseEnv = () =>
  [
    !serverEnv.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !serverEnv.supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    !serverEnv.supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
  ].filter(Boolean) as string[];

export const getInvalidOfficialSupabaseEnv = () =>
  [
    serverEnv.supabaseUrl && !isValidSupabaseUrl(serverEnv.supabaseUrl) ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    serverEnv.supabaseAnonKey && isPlaceholderValue(serverEnv.supabaseAnonKey) ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    serverEnv.supabaseServiceRoleKey && isPlaceholderValue(serverEnv.supabaseServiceRoleKey)
      ? 'SUPABASE_SERVICE_ROLE_KEY'
      : null,
  ].filter(Boolean) as string[];

export const hasOfficialSupabase =
  isValidSupabaseUrl(serverEnv.supabaseUrl) &&
  !isPlaceholderValue(serverEnv.supabaseAnonKey) &&
  !isPlaceholderValue(serverEnv.supabaseServiceRoleKey);

export const officialSupabaseConfigError = () => {
  const missing = getMissingOfficialSupabaseEnv();
  const invalid = getInvalidOfficialSupabaseEnv();

  if (missing.length === 0 && invalid.length === 0) {
    return '';
  }

  const parts: string[] = [];

  if (missing.length) {
    parts.push(`preencha: ${missing.join(', ')}`);
  }

  if (invalid.length) {
    parts.push(`corrija valores invalidos em: ${invalid.join(', ')}`);
  }

  return `Supabase oficial nao configurado. ${parts.join('. ')}.`;
};
