'use client';

import { useEffect, useMemo, useState } from 'react';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { EtapasGerador } from '@/components/dashboard/projeto/EtapasGerador';
import { EtapasPreview } from '@/components/dashboard/projeto/EtapasPreview';
import { EtapasTemplates } from '@/components/dashboard/projeto/EtapasTemplates';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { generateStagesFromChecklist } from '@/lib/etapasGerador';
import { createId } from '@/lib/utils';
import type { ClientPortalStage, StageTemplate } from '@/types/dashboard';

type StageDraft = Omit<ClientPortalStage, 'id' | 'createdAt' | 'completedAt'>;

const statusOptions: ClientPortalStage['status'][] = ['pendente', 'em_andamento', 'concluida'];

const addDaysToDate = (value: string, days: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const diffDays = (start: string, end: string) =>
  Math.max(Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)), 0);

export function EtapasEditor({ projectId }: { projectId: string }) {
  const { workspace, replaceClientStages, saveStageTemplate } = useDashboard();
  const project = workspace?.projects.find((item) => item.id === projectId) || null;
  const checklist = workspace?.projectChecklists.find((item) => item.projectId === projectId) || null;
  const checklistResponses = useMemo(
    () =>
      checklist
        ? (workspace?.checklistResponses || []).filter((item) => item.checklistId === checklist.id)
        : [],
    [workspace?.checklistResponses, checklist],
  );
  const templates = useMemo(() => {
    const allTemplates = workspace?.stageTemplates || [];
    if (!project) {
      return allTemplates;
    }

    const filtered = allTemplates.filter((template) =>
      project.type.toLowerCase().includes(template.projectType.toLowerCase()),
    );

    return filtered.length > 0 ? filtered : allTemplates;
  }, [workspace?.stageTemplates, project]);
  const existingStages = useMemo(
    () =>
      (workspace?.clientStages || [])
        .filter((item) => item.projectId === projectId)
        .sort((first, second) => first.order - second.order),
    [workspace?.clientStages, projectId],
  );

  const [startDate, setStartDate] = useState('');
  const [stages, setStages] = useState<StageDraft[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!project) {
      return;
    }

    setStartDate(project.createdAt.slice(0, 10));
    setStages(
      existingStages.length > 0
        ? existingStages.map((stage) => ({
            projectId: stage.projectId,
            name: stage.name,
            description: stage.description,
            dueDate: stage.dueDate,
            status: stage.status,
            order: stage.order,
          }))
        : [
            {
              projectId,
              name: 'Kickoff',
              description: 'Inicio oficial do projeto',
              dueDate: project.createdAt.slice(0, 10),
              status: 'em_andamento',
              order: 1,
            },
          ],
    );
  }, [project, existingStages, projectId]);

  if (!project) {
    return null;
  }

  const normalizeStages = (value: StageDraft[]) =>
    value.map((stage, index) => ({
      ...stage,
      order: index + 1,
      projectId,
    }));

  const applyTemplate = (template: StageTemplate) => {
    setStages(
      normalizeStages(
        template.steps.map((step, index) => ({
          projectId,
          name: step.name,
          description: step.description,
          dueDate: addDaysToDate(startDate, step.daysFromStart),
          status: index === 0 ? 'em_andamento' : 'pendente',
          order: index + 1,
        })),
      ),
    );
  };

  const previewStages: ClientPortalStage[] = stages.map((stage, index) => ({
    id: `preview-stage-${index}`,
    ...stage,
    order: index + 1,
    createdAt: project.createdAt,
    completedAt: stage.status === 'concluida' ? new Date().toISOString() : null,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <SectionTitle title="Editor de etapas" description="Edite a trilha que aparece no portal do cliente." />
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
              <input
                className="field"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  setStages((current) =>
                    normalizeStages([
                      ...current,
                      {
                        projectId,
                        name: 'Nova etapa',
                        description: null,
                        dueDate: current[current.length - 1]?.dueDate || startDate,
                        status: 'pendente',
                        order: current.length + 1,
                      },
                    ]),
                  )
                }
                className="inline-flex h-12 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel-alt)] px-4 text-sm font-medium"
              >
                <Plus size={16} />
                Nova etapa
              </button>
            </div>

            <div className="space-y-3">
              {stages.map((stage, index) => (
                <div
                  key={`${stage.name}-${index}`}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null || dragIndex === index) {
                      return;
                    }

                    const ordered = [...stages];
                    const [moved] = ordered.splice(dragIndex, 1);
                    ordered.splice(index, 0, moved);
                    setStages(normalizeStages(ordered));
                    setDragIndex(null);
                  }}
                  className="border border-[var(--line)] bg-[var(--panel-alt)]"
                >
                  <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[30px_1fr_180px_160px_150px]">
                    <div className="flex items-center justify-center text-[var(--muted)]">
                      <GripVertical size={16} />
                    </div>
                    <div className="space-y-3">
                      <input
                        className="field"
                        value={stage.name}
                        onChange={(event) =>
                          setStages((current) =>
                            normalizeStages(
                              current.map((entry, currentIndex) =>
                                currentIndex === index ? { ...entry, name: event.target.value } : entry,
                              ),
                            ),
                          )
                        }
                      />
                      <textarea
                        className="field"
                        rows={2}
                        value={stage.description || ''}
                        onChange={(event) =>
                          setStages((current) =>
                            normalizeStages(
                              current.map((entry, currentIndex) =>
                                currentIndex === index
                                  ? { ...entry, description: event.target.value || null }
                                  : entry,
                              ),
                            ),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <input
                        className="field"
                        type="date"
                        value={stage.dueDate}
                        onChange={(event) =>
                          setStages((current) =>
                            normalizeStages(
                              current.map((entry, currentIndex) =>
                                currentIndex === index ? { ...entry, dueDate: event.target.value } : entry,
                              ),
                            ),
                          )
                        }
                      />
                      <p className="text-xs muted">+{diffDays(startDate, stage.dueDate)} dias desde o inicio</p>
                    </div>
                    <div className="space-y-3">
                      <select
                        className="field"
                        value={stage.status}
                        onChange={(event) =>
                          setStages((current) =>
                            normalizeStages(
                              current.map((entry, currentIndex) =>
                                currentIndex === index
                                  ? {
                                      ...entry,
                                      status: event.target.value as ClientPortalStage['status'],
                                    }
                                  : entry,
                              ),
                            ),
                          )
                        }
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <StatusPill value={stage.status} />
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setStages((current) => normalizeStages(current.filter((_, currentIndex) => currentIndex !== index)))
                        }
                        className="inline-flex h-11 w-full items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-medium"
                      >
                        <Trash2 size={15} />
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void replaceClientStages(projectId, normalizeStages(stages))}
              className="inline-flex h-12 w-full items-center justify-center gap-2 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)]"
            >
              <Save size={16} />
              Salvar etapas no portal
            </button>
          </div>
        </Panel>

        <div className="space-y-4">
          <EtapasGerador
            checklist={checklist}
            onGenerate={() =>
              setStages(
                normalizeStages(
                  generateStagesFromChecklist({
                    project,
                    checklist,
                    responses: checklistResponses,
                    startDate,
                    desiredEndDate: project.dueDate,
                  }) as StageDraft[],
                ),
              )
            }
          />
          <EtapasPreview stages={previewStages} projectStart={startDate} projectEnd={project.dueDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        <EtapasTemplates templates={templates} onApplyTemplate={applyTemplate} />
        <Panel>
          <SectionTitle title="Salvar template" description="Transforme a trilha atual em um modelo reutilizavel." />
          <div className="space-y-4 p-4">
            <input
              className="field"
              placeholder="Nome do template"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
            />
            <button
              type="button"
              disabled={!templateName.trim() || stages.length === 0}
              onClick={() =>
                void saveStageTemplate({
                  id: createId('stage-template'),
                  name: templateName.trim(),
                  projectType: project.type,
                  createdBy: 'vexcoding',
                  createdAt: new Date().toISOString(),
                  isDefault: false,
                  steps: normalizeStages(stages).map((stage, index) => ({
                    id: createId('stage-template-step'),
                    name: stage.name,
                    description: stage.description,
                    daysFromStart: diffDays(startDate, stage.dueDate),
                    order: index + 1,
                  })),
                }).then(() => setTemplateName(''))
              }
              className="h-12 w-full border border-[var(--line)] bg-[var(--panel-alt)] text-sm font-medium disabled:opacity-50"
            >
              Salvar template atual
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
