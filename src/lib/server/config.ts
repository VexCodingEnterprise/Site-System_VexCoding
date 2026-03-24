import 'server-only';

import { isPlaceholderValue, isValidSupabaseUrl, publicEnv } from '@/lib/config';

const readServerEnv = (key: string) => String(process.env[key] || '').trim();

export const getServerEnv = () => ({
  ...publicEnv,
  supabaseServiceRoleKey: readServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
  resendApiKey: readServerEnv('RESEND_API_KEY'),
  sessionSecret: readServerEnv('SESSION_SECRET') || 'vexcoding-dev-session-secret',
});

export const getMissingOfficialSupabaseEnv = () => {
  const serverEnv = getServerEnv();

  return [
    !serverEnv.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !serverEnv.supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    !serverEnv.supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
  ].filter(Boolean) as string[];
};

export const getInvalidOfficialSupabaseEnv = () => {
  const serverEnv = getServerEnv();

  return [
    serverEnv.supabaseUrl && !isValidSupabaseUrl(serverEnv.supabaseUrl) ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    serverEnv.supabaseAnonKey && isPlaceholderValue(serverEnv.supabaseAnonKey) ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    serverEnv.supabaseServiceRoleKey && isPlaceholderValue(serverEnv.supabaseServiceRoleKey)
      ? 'SUPABASE_SERVICE_ROLE_KEY'
      : null,
  ].filter(Boolean) as string[];
};

export const hasOfficialSupabase = () => {
  const serverEnv = getServerEnv();

  return (
    isValidSupabaseUrl(serverEnv.supabaseUrl) &&
    !isPlaceholderValue(serverEnv.supabaseAnonKey) &&
    !isPlaceholderValue(serverEnv.supabaseServiceRoleKey)
  );
};

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
