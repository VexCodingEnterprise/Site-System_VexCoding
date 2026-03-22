import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/auth';
import {
  getOfficialWorkspace,
  runOfficialWorkspaceAction,
  saveWorkspaceSettingsOfficial,
  updateOfficialPartnerPassword,
  updateOfficialPartnerPreferences,
} from '@/lib/server/workspace-db';
import type { WorkspaceSettings } from '@/types/dashboard';

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  try {
    const workspace = await getOfficialWorkspace();
    return NextResponse.json({ workspace });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro ao carregar workspace oficial.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as
      | { scope: 'workspace'; action: Parameters<typeof runOfficialWorkspaceAction>[0] }
      | { scope: 'preferences'; patch: { notificationsEmail: boolean; notificationsBrowser: boolean; themePreference: 'light' | 'dark' | 'system' } }
      | { scope: 'password'; nextPassword: string }
      | { scope: 'settings'; settings: WorkspaceSettings };

    if (body.scope === 'workspace') {
      const result = await runOfficialWorkspaceAction(body.action, session.partnerId);
      return NextResponse.json({ ok: true, result: result || null });
    }

    if (body.scope === 'preferences') {
      await updateOfficialPartnerPreferences(session.username, body.patch);
      return NextResponse.json({ ok: true });
    }

    if (body.scope === 'password') {
      await updateOfficialPartnerPassword(session.username, body.nextPassword);
      return NextResponse.json({ ok: true });
    }

    if (body.scope === 'settings') {
      await saveWorkspaceSettingsOfficial(body.settings);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: 'Acao invalida.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro ao executar acao oficial.' },
      { status: 500 },
    );
  }
}
