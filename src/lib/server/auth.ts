import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { DashboardSession, Partner, PartnerId } from '@/types/dashboard';
import { publicEnv } from '@/lib/config';
import { assertOfficialMode } from '@/lib/server/supabase-admin';
import { hasOfficialSupabase } from '@/lib/server/config';

const createAuthClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components são somente leitura; o middleware persiste cookies renovados.
        }
      },
    },
  });
};

type PartnerRow = {
  username: string;
  auth_user_id: string | null;
  display_name: string;
  role: string;
  email: string;
  avatar_color: string;
  notifications_email: boolean;
  notifications_browser: boolean;
  theme_preference: Partner['themePreference'];
  criado_em: string;
};

const partnerSelect =
  'username, auth_user_id, display_name, role, email, avatar_color, notifications_email, notifications_browser, theme_preference, criado_em';

const mapPartnerSession = (row: PartnerRow): DashboardSession => ({
  partnerId: row.username as PartnerId,
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  avatarColor: row.avatar_color || '#0A0A0A',
});

export const getSession = async (): Promise<DashboardSession | null> => {
  if (!hasOfficialSupabase()) {
    return null;
  }

  const authClient = await createAuthClient();
  const { data, error } = await authClient.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const { data: partner, error: partnerError } = await assertOfficialMode()
    .from('partners')
    .select(partnerSelect)
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  if (partnerError || !partner) {
    return null;
  }

  return mapPartnerSession(partner as PartnerRow);
};

export const signInPartner = async (username: string, password: string) => {
  if (!hasOfficialSupabase()) {
    return null;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const admin = assertOfficialMode();
  const { data: partner, error: partnerError } = await admin
    .from('partners')
    .select(partnerSelect)
    .eq('username', normalizedUsername)
    .maybeSingle();

  if (partnerError || !partner) {
    return null;
  }

  const authClient = await createAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({
    email: String((partner as PartnerRow).email),
    password,
  });

  if (error || !data.user) {
    return null;
  }

  const partnerRow = partner as PartnerRow;

  if (partnerRow.auth_user_id && partnerRow.auth_user_id !== data.user.id) {
    await authClient.auth.signOut();
    return null;
  }

  if (!partnerRow.auth_user_id) {
    const { error: linkError } = await admin
      .from('partners')
      .update({ auth_user_id: data.user.id })
      .eq('username', normalizedUsername)
      .is('auth_user_id', null);

    if (linkError) {
      await authClient.auth.signOut();
      return null;
    }
  }

  return mapPartnerSession({ ...partnerRow, auth_user_id: data.user.id });
};

export const signOut = async () => {
  if (!hasOfficialSupabase()) {
    return;
  }

  await (await createAuthClient()).auth.signOut();
};

export const updateCurrentPartnerPassword = async (nextPassword: string) => {
  const password = nextPassword.trim();
  if (password.length < 12 || password.length > 128) {
    throw new Error('A senha deve ter entre 12 e 128 caracteres.');
  }

  const authClient = await createAuthClient();
  const { data, error } = await authClient.auth.getUser();

  if (error || !data.user) {
    throw new Error('Sessão expirada. Entre novamente.');
  }

  const { error: updateError } = await authClient.auth.updateUser({ password });
  if (updateError) {
    throw new Error('Não foi possível atualizar a senha.');
  }
};
