'use client';

import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { calculateChecklistProgress } from '@/lib/checklist';
import { formatDateTime } from '@/lib/utils';
import type { ChecklistResponse, Project, ProjectChecklist } from '@/types/dashboard';

const statusLabel: Record<ProjectChecklist['status'], string> = {
  rascunho: 'Não enviado',
  liberado: 'Aguardando cliente',
  em_preenchimento: 'Em preenchimento',
  completo: 'Completo',
};

export function ChecklistStatus({
  project,
  checklist,
  responses,
  onSaveDraft,
  onRelease,
  onNotify,
  onReopen,
}: {
  project: Project;
  checklist: ProjectChecklist | null;
  responses: ChecklistResponse[];
  onSaveDraft: () => void;
  onRelease: () => void;
  onNotify: () => void;
  onReopen: () => void;
}) {
  const progress = calculateChecklistProgress(checklist, responses);

  return (
    <Panel>
      <SectionTitle title="Status do checklist" description="Acompanhe a evolução do cliente antes de iniciar a execução." />
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
      <StatusPill value={checklist ? statusLabel[checklist.status] : 'Não criado'} />
          {checklist?.releasedAt ? <StatusPill value={`Liberado ${formatDateTime(checklist.releasedAt)}`} /> : null}
          {checklist?.submittedAt ? <StatusPill value={`Enviado ${formatDateTime(checklist.submittedAt)}`} /> : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="panel-alt px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Progresso</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{progress.percentage}%</p>
            <div className="mt-3 h-2 bg-[var(--panel)]">
              <div className="h-2 bg-[var(--text)]" style={{ width: `${progress.percentage}%` }} />
            </div>
          </div>
          <div className="panel-alt px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Obrigatorios</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--text)]">
              {progress.requiredAnswered}/{progress.requiredTotal}
            </p>
            <p className="mt-2 text-sm muted">Itens obrigatorios preenchidos pelo cliente.</p>
          </div>
        </div>

        <div className="panel-alt px-4 py-4">
      <p className="text-sm font-medium text-[var(--text)]">Link rápido para o cliente</p>
          <p className="mt-2 text-sm muted">
            Projeto {project.name}. Use a mensagem pronta para enviar o acesso ao portal e acelerar o briefing.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onSaveDraft}
            className="h-12 w-full border border-[var(--line)] bg-[var(--panel-alt)] text-sm font-medium"
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            onClick={onRelease}
            className="h-12 w-full border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)]"
          >
            Liberar para o cliente
          </button>
          <button
            type="button"
            onClick={onNotify}
            className="h-12 w-full border border-[var(--line)] bg-[var(--panel)] text-sm font-medium"
          >
            Notificar via WhatsApp
          </button>
          {checklist?.status === 'completo' ? (
            <button
              type="button"
              onClick={onReopen}
              className="h-12 w-full border border-[var(--line)] bg-[var(--panel)] text-sm font-medium"
            >
              Reabrir para edicao
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
