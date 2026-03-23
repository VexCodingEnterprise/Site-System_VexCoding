export const env = {
  supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
  supabaseAnonKey: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
  supabaseServiceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
  resendApiKey: (process.env.RESEND_API_KEY || '').trim(),
  sessionSecret: (process.env.SESSION_SECRET || 'vexcoding-dev-session-secret').trim(),
  projectDocumentsBucket: (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'project-documents').trim(),
};

const isPlaceholderValue = (value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return true;
  }

  return (
    normalized.includes('SEU-PROJETO') ||
    normalized.includes('SUA_SERVICE_ROLE_KEY') ||
    normalized.includes('SEU_ANON_KEY') ||
    normalized.includes('gere-um-segredo')
  );
};

const isValidSupabaseUrl = (value: string) => {
  if (isPlaceholderValue(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
};

export const getMissingOfficialSupabaseEnv = () =>
  [
    !env.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !env.supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    !env.supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
  ].filter(Boolean) as string[];

export const getMissingPublicSupabaseEnv = () =>
  [
    !env.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !env.supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
  ].filter(Boolean) as string[];

export const getInvalidOfficialSupabaseEnv = () =>
  [
    env.supabaseUrl && !isValidSupabaseUrl(env.supabaseUrl) ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    env.supabaseAnonKey && isPlaceholderValue(env.supabaseAnonKey) ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    env.supabaseServiceRoleKey && isPlaceholderValue(env.supabaseServiceRoleKey) ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
  ].filter(Boolean) as string[];

export const getInvalidPublicSupabaseEnv = () =>
  [
    env.supabaseUrl && !isValidSupabaseUrl(env.supabaseUrl) ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    env.supabaseAnonKey && isPlaceholderValue(env.supabaseAnonKey) ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
  ].filter(Boolean) as string[];

export const hasOfficialSupabase =
  isValidSupabaseUrl(env.supabaseUrl) &&
  !isPlaceholderValue(env.supabaseAnonKey) &&
  !isPlaceholderValue(env.supabaseServiceRoleKey);

const buildConfigErrorMessage = (missing: string[], invalid: string[]) => {
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

export const officialSupabaseConfigError = () =>
  buildConfigErrorMessage(getMissingOfficialSupabaseEnv(), getInvalidOfficialSupabaseEnv());

export const publicSupabaseConfigError = () =>
  buildConfigErrorMessage(getMissingPublicSupabaseEnv(), getInvalidPublicSupabaseEnv());
