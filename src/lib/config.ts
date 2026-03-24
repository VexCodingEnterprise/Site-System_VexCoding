export const publicEnv = {
  supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
  supabaseAnonKey: (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim(),
  projectDocumentsBucket: (process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'project-documents').trim(),
};

export const isPlaceholderValue = (value: string) => {
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

export const isValidSupabaseUrl = (value: string) => {
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
    !publicEnv.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !publicEnv.supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' : null,
  ].filter(Boolean) as string[];

export const getMissingPublicSupabaseEnv = () =>
  [
    !publicEnv.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !publicEnv.supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' : null,
  ].filter(Boolean) as string[];

export const getInvalidOfficialSupabaseEnv = () =>
  [
    publicEnv.supabaseUrl && !isValidSupabaseUrl(publicEnv.supabaseUrl) ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    publicEnv.supabaseAnonKey && isPlaceholderValue(publicEnv.supabaseAnonKey)
      ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
      : null,
  ].filter(Boolean) as string[];

export const getInvalidPublicSupabaseEnv = () =>
  [
    publicEnv.supabaseUrl && !isValidSupabaseUrl(publicEnv.supabaseUrl) ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    publicEnv.supabaseAnonKey && isPlaceholderValue(publicEnv.supabaseAnonKey)
      ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
      : null,
  ].filter(Boolean) as string[];

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
