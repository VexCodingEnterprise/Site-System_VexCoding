'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, CheckCheck, GripVertical } from 'lucide-react';
import { clientPortalStageStatusOptions } from '@/data/demo';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';
import type { ClientPortalStage } from '@/types/dashboard';

export function GerenciarEtapas({
  projectId,
}: {
  projectId: string;
}) {
  const {
    workspace,
    createClientStage,
    updateClientStage,
    deleteClientStage,
    reorderClientStages,
    completeClientStage,
  } = useDashboard();

  const stages = useMemo(
    () => (workspace?.clientStages || []).filter((stage) => stage.projectId === projectId).sort((a, b) => a.order - b.order),
    [workspace?.clientStages, projectId],
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [newStage, setNewStage] = useState({
    name: '',
    description: '',
    dueDate: new Date().toISOString().slice(0, 10),
    status: 'pendente' as ClientPortalStage['status'],
  });

  return (
    <Panel>
      <SectionTitle title="Gerenciar etapas" description="Crie, edite, reordene e conclua as etapas visiveis no portal do cliente." />
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_180px_150px]">
          <input
            className="field"
            placeholder="Nome da etapa"
            value={newStage.name}
            onChange={(event) => setNewStage((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="field"
            placeholder="Descricao opcional"
            value={newStage.description}
            onChange={(event) => setNewStage((current) => ({ ...current, description: event.target.value }))}
          />
          <input
            className="field"
            type="date"
            value={newStage.dueDate}
            onChange={(event) => setNewStage((current) => ({ ...current, dueDate: event.target.value }))}
          />
          <button
            type="button"
            disabled={!newStage.name}
            onClick={() =>
              void createClientStage({
                projectId,
                name: newStage.name,
                description: newStage.description || null,
                dueDate: newStage.dueDate,
                status: newStage.status,
                order: stages.length + 1,
              }).then(() =>
                setNewStage({
                  name: '',
                  description: '',
                  dueDate: new Date().toISOString().slice(0, 10),
                  status: 'pendente',
                }),
              )
            }
            className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={15} />
            Nova etapa
          </button>
        </div>

        <div className="space-y-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              draggable
              onDragStart={() => setDragId(stage.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (!dragId || dragId === stage.id) {
                  return;
                }

                const orderedIds = [...stages]
                  .sort((a, b) => a.order - b.order)
                  .map((item) => item.id)
                  .filter((id) => id !== dragId);

                const targetIndex = orderedIds.indexOf(stage.id);
                orderedIds.splice(targetIndex, 0, dragId);
                void reorderClientStages(projectId, orderedIds);
                setDragId(null);
              }}
              className="border border-[var(--line)] bg-[var(--panel-alt)] px-4 py-4"
            >
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[26px_1fr_220px_170px_250px]">
                <div className="flex items-center justify-center text-[var(--muted)]">
                  <GripVertical size={16} />
                </div>
                <div className="space-y-3">
                  <input
                    className="field"
                    value={stage.name}
                    onChange={(event) => void updateClientStage(stage.id, { name: event.target.value })}
                  />
                  <textarea
                    className="field"
                    rows={2}
                    value={stage.description || ''}
                    onChange={(event) => void updateClientStage(stage.id, { description: event.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <input
                    className="field"
                    type="date"
                    value={stage.dueDate}
                    onChange={(event) => void updateClientStage(stage.id, { dueDate: event.target.value })}
                  />
                  <select
                    className="field"
                    value={stage.status}
                    onChange={(event) => void updateClientStage(stage.id, { status: event.target.value as ClientPortalStage['status'] })}
                  >
                    {clientPortalStageStatusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <StatusPill value={stage.status} />
                  <p className="text-xs muted">Ordem #{stage.order}</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row xl:flex-col">
                  <button
                    type="button"
                    onClick={() =>
                      void completeClientStage(stage.id, `${stage.name} concluida`, stage.description || undefined)
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--text)] bg-[var(--text)] px-3 text-sm font-medium text-[var(--bg)]"
                  >
                    <CheckCheck size={15} />
                    Concluir
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteClientStage(stage.id)}
                    className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-medium"
                  >
                    <Trash2 size={15} />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
