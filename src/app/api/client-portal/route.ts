import { NextResponse } from 'next/server';
import { assertOfficialMode } from '@/lib/server/supabase-admin';
import { createId } from '@/lib/utils';
import { getClientPortalSnapshotByUserId } from '@/lib/server/workspace-db';
import type { ChecklistResponseValue, ProjectChecklist } from '@/types/dashboard';

type AuthorizedClient = {
  supabase: ReturnType<typeof assertOfficialMode>;
  userId: string;
  clientRow: {
    id: string;
    user_id: string | null;
    projeto_id: string;
    nome: string;
    email: string;
  };
};

type AuthorizedClientError = { errorResponse: NextResponse };
type AuthorizedClientResult = AuthorizedClient | AuthorizedClientError;

const isAuthorizedClientError = (value: AuthorizedClientResult): value is AuthorizedClientError =>
  'errorResponse' in value;

async function getAuthorizedClient(request: Request): Promise<AuthorizedClientResult> {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return { errorResponse: NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 }) } as const;
  }

  const supabase = assertOfficialMode();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { errorResponse: NextResponse.json({ message: 'Sessao do cliente invalida.' }, { status: 401 }) } as const;
  }

  const { data: clientRow, error: clientError } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (clientError || !clientRow) {
    return {
      errorResponse: NextResponse.json(
        { message: clientError?.message || 'Nenhum portal de cliente vinculado a este usuario.' },
        { status: 404 },
      ),
    } as const;
  }

  return {
    supabase,
    userId: data.user.id,
    clientRow: clientRow as AuthorizedClient['clientRow'],
  } satisfies AuthorizedClient;
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthorizedClient(request);
    if (isAuthorizedClientError(auth)) {
      return auth.errorResponse;
    }
    const snapshot = await getClientPortalSnapshotByUserId(auth.userId);

    if (!snapshot) {
      return NextResponse.json({ message: 'Nenhum portal de cliente vinculado a este usuario.' }, { status: 404 });
    }

    return NextResponse.json({ snapshot });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Nao foi possivel carregar o portal do cliente.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthorizedClient(request);
    if (isAuthorizedClientError(auth)) {
      return auth.errorResponse;
    }

    const body = (await request.json()) as
      | {
          action: 'checklist-save';
          checklistId: string;
          responses: Array<{ itemId: string; value: ChecklistResponseValue }>;
          checklistPatch?: Partial<Pick<ProjectChecklist, 'status' | 'releasedAt' | 'submittedAt' | 'reopenedAt' | 'lastSavedAt'>>;
        }
      | { action: 'checklist-request-reopen'; checklistId: string };

    const projectId = String(auth.clientRow.projeto_id);

    if (body.action === 'checklist-save') {
      const { data: checklistRow, error: checklistError } = await auth.supabase
        .from('checklists_projeto')
        .select('id, projeto_id')
        .eq('id', body.checklistId)
        .eq('projeto_id', projectId)
        .maybeSingle();

      if (checklistError || !checklistRow) {
        return NextResponse.json(
          { message: checklistError?.message || 'Checklist nao encontrado para este cliente.' },
          { status: 404 },
        );
      }

      const now = new Date().toISOString();
      const rows = body.responses.map((response) => ({
        id: createId('checklist-response'),
        checklist_id: body.checklistId,
        item_id: response.itemId,
        valor: response.value,
        atualizado_em: now,
      }));

      if (rows.length > 0) {
        const { error: responsesError } = await auth.supabase
          .from('checklist_respostas')
          .upsert(rows, { onConflict: 'checklist_id,item_id' });

        if (responsesError) {
          return NextResponse.json({ message: responsesError.message }, { status: 500 });
        }
      }

      const patch = body.checklistPatch || {};
      const checklistUpdate: Record<string, unknown> = {
        ultimo_salvamento_em: patch.lastSavedAt || now,
      };

      if (typeof patch.status !== 'undefined') checklistUpdate.status = patch.status;
      if (typeof patch.releasedAt !== 'undefined') checklistUpdate.liberado_em = patch.releasedAt;
      if (typeof patch.submittedAt !== 'undefined') checklistUpdate.enviado_em = patch.submittedAt;
      if (typeof patch.reopenedAt !== 'undefined') checklistUpdate.reaberto_em = patch.reopenedAt;

      const { error: updateError } = await auth.supabase
        .from('checklists_projeto')
        .update(checklistUpdate)
        .eq('id', body.checklistId);

      if (updateError) {
        return NextResponse.json({ message: updateError.message }, { status: 500 });
      }

      const snapshot = await getClientPortalSnapshotByUserId(auth.userId);
      return NextResponse.json({ ok: true, snapshot });
    }

    if (body.action === 'checklist-request-reopen') {
      const { data: checklistRow, error: checklistError } = await auth.supabase
        .from('checklists_projeto')
        .select('id')
        .eq('id', body.checklistId)
        .eq('projeto_id', projectId)
        .maybeSingle();

      if (checklistError || !checklistRow) {
        return NextResponse.json(
          { message: checklistError?.message || 'Checklist nao encontrado para este cliente.' },
          { status: 404 },
        );
      }

      const { error: messageError } = await auth.supabase.from('mensagens_projeto').insert({
        id: createId('message'),
        projeto_id: projectId,
        remetente_tipo: 'cliente',
        remetente_nome: String(auth.clientRow.nome),
        texto: 'Solicito a reabertura do checklist para enviar ajustes.',
        criado_em: new Date().toISOString(),
      });

      if (messageError) {
        return NextResponse.json({ message: messageError.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: 'Acao invalida.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Nao foi possivel atualizar o portal do cliente.' },
      { status: 500 },
    );
  }
}
