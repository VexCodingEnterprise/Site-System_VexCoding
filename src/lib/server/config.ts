import 'server-only';

import { isPlaceholderValue, isValidSupabaseUrl, publicEnv } from '@/lib/config';

const readServerEnv = (key: string) => String(process.env[key] || '').trim();

export const getServerEnv = () => ({
  ...publicEnv,
  supabaseSecretKey: readServerEnv('SUPABASE_SECRET_KEY'),
});

export const getMissingOfficialSupabaseEnv = () => {
  const serverEnv = getServerEnv();

  return [
    !serverEnv.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !serverEnv.supabasePublishableKey ? 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' : null,
    !serverEnv.supabaseSecretKey ? 'SUPABASE_SECRET_KEY' : null,
  ].filter(Boolean) as string[];
};

export const getInvalidOfficialSupabaseEnv = () => {
  const serverEnv = getServerEnv();

  return [
    serverEnv.supabaseUrl && !isValidSupabaseUrl(serverEnv.supabaseUrl) ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    serverEnv.supabasePublishableKey && isPlaceholderValue(serverEnv.supabasePublishableKey)
      ? 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
      : null,
    serverEnv.supabaseSecretKey && isPlaceholderValue(serverEnv.supabaseSecretKey)
      ? 'SUPABASE_SECRET_KEY'
      : null,
  ].filter(Boolean) as string[];
};

export const hasOfficialSupabase = () => {
  const serverEnv = getServerEnv();

  return (
    isValidSupabaseUrl(serverEnv.supabaseUrl) &&
    !isPlaceholderValue(serverEnv.supabasePublishableKey) &&
    !isPlaceholderValue(serverEnv.supabaseSecretKey)
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
    parts.push(`corrija valores inválidos em: ${invalid.join(', ')}`);
  }

  return `Supabase oficial não configurado. ${parts.join('. ')}.`;
};
