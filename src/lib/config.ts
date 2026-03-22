export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  sessionSecret: process.env.SESSION_SECRET || 'vexcoding-dev-session-secret',
  projectDocumentsBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'project-documents',
};

export const hasOfficialSupabase =
  Boolean(env.supabaseUrl) && Boolean(env.supabaseAnonKey) && Boolean(env.supabaseServiceRoleKey);
