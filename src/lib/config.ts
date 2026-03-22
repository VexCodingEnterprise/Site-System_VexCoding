export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  sessionSecret: process.env.SESSION_SECRET || 'vexcoding-dev-session-secret',
  projectDocumentsBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'project-documents',
};

export const getMissingOfficialSupabaseEnv = () =>
  [
    !env.supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !env.supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
    !env.supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
  ].filter(Boolean) as string[];

export const hasOfficialSupabase =
  Boolean(env.supabaseUrl) && Boolean(env.supabaseAnonKey) && Boolean(env.supabaseServiceRoleKey);

export const officialSupabaseConfigError = () => {
  const missing = getMissingOfficialSupabaseEnv();

  if (missing.length === 0) {
    return '';
  }

  return `Supabase oficial nao configurado. Preencha: ${missing.join(', ')}.`;
};
