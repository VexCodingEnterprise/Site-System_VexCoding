import { NextResponse } from 'next/server';
import { getSession, updateCurrentPartnerPassword } from '@/lib/server/auth';
import {
  getOfficialWorkspace,
  runOfficialWorkspaceAction,
  updateOfficialPartnerPreferences,
} from '@/lib/server/workspace-db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const workspace = await getOfficialWorkspace();
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('workspace_load_failed', error instanceof Error ? error.message : 'unknown_error');
    return NextResponse.json({ message: 'Não foi possível carregar o workspace oficial.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as
      | { scope: 'workspace'; action: Parameters<typeof runOfficialWorkspaceAction>[0] }
      | { scope: 'preferences'; patch: { notificationsEmail: boolean; notificationsBrowser: boolean; themePreference: 'light' | 'dark' | 'system' } }
      | { scope: 'password'; nextPassword: string };

    if (body.scope === 'workspace') {
      const result = await runOfficialWorkspaceAction(body.action, session.partnerId);
      return NextResponse.json({ ok: true, result: result || null });
    }

    if (body.scope === 'preferences') {
      await updateOfficialPartnerPreferences(session.username, body.patch);
      return NextResponse.json({ ok: true });
    }

    if (body.scope === 'password') {
      await updateCurrentPartnerPassword(body.nextPassword);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: 'Acao invalida.' }, { status: 400 });
  } catch (error) {
    console.error('workspace_action_failed', error instanceof Error ? error.message : 'unknown_error');
    return NextResponse.json({ message: 'Não foi possível executar a ação.' }, { status: 500 });
  }
}
