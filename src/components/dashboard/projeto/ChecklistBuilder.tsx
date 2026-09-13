'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { ChecklistStatus } from '@/components/dashboard/projeto/ChecklistStatus';
import { ChecklistTemplates } from '@/components/dashboard/projeto/ChecklistTemplates';
import { useDashboard } from '@/components/providers/dashboard-provider';
import {
  cloneChecklistStructure,
  createBlankChecklistStructure,
  createChecklistFromTemplate,
  getChecklistTemplateForProjectType,
} from '@/lib/checklist';
import { createId } from '@/lib/utils';
import type {
  ChecklistFieldType,
  ChecklistItem,
  ChecklistStructure,
  ChecklistTemplate,
  ProjectChecklist,
} from '@/types/dashboard';

const fieldTypeOptions: Array<{ value: ChecklistFieldType; label: string }> = [
  { value: 'text', label: 'Texto curto' },
  { value: 'textarea', label: 'Texto longo' },
  { value: 'file', label: 'Upload de arquivo' },
  { value: 'image_gallery', label: 'Upload multiplo de imagens' },
  { value: 'single_choice', label: 'Escolha unica' },
  { value: 'multi_choice', label: 'Multipla escolha' },
  { value: 'link', label: 'Link' },
  { value: 'color', label: 'Cor' },
  { value: 'boolean', label: 'Sim / Não' },
];

const reorderStructure = (structure: ChecklistStructure): ChecklistStructure => {
  const sections = [...structure.sections]
    .sort((first, second) => first.order - second.order)
    .map((section, index) => ({ ...section, order: index + 1 }));
  const items = sections.flatMap((section) =>
    structure.items
      .filter((item) => item.sectionId === section.id)
      .sort((first, second) => first.order - second.order)
      .map((item, index) => ({ ...item, sectionId: section.id, order: index + 1 })),
  );

  return { sections, items };
};

const createSection = (order: number) => ({
  id: createId('checklist-section'),
  title: 'Nova secao',
  description: null,
  order,
  collapsed: false,
});

const createItem = (sectionId: string, order: number): ChecklistItem => ({
  id: createId('checklist-item'),
  sectionId,
  title: 'Novo item',
  type: 'text',
  required: false,
  helpText: null,
  options: [],
  order,
  maxFiles: null,
  acceptedFormats: [],
});

export function ChecklistBuilder({ projectId }: { projectId: string }) {
  const {
    workspace,
    saveChecklistTemplate,
    upsertProjectChecklist,
  } = useDashboard();
  const project = workspace?.projects.find((item) => item.id === projectId) || null;
  const currentChecklist = workspace?.projectChecklists.find((item) => item.projectId === projectId) || null;
  const responses = useMemo(
    () =>
      currentChecklist
        ? (workspace?.checklistResponses || []).filter((item) => item.checklistId === currentChecklist.id)
        : [],
    [workspace?.checklistResponses, currentChecklist],
  );
  const templates = useMemo(() => {
    const allTemplates = workspace?.checklistTemplates || [];
    if (!project) {
      return allTemplates;
    }

    const filtered = allTemplates.filter((template) =>
      project.type.toLowerCase().includes(template.projectType.toLowerCase()),
    );

    return filtered.length > 0 ? filtered : allTemplates;
  }, [workspace?.checklistTemplates, project]);

  const [draft, setDraft] = useState<ProjectChecklist | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [dragItemId, setDragItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!project) {
      return;
    }

    if (currentChecklist) {
      setDraft({
        ...currentChecklist,
        structure: cloneChecklistStructure(currentChecklist.structure),
      });
      return;
    }

    const template = getChecklistTemplateForProjectType(project.type);
    setDraft(createChecklistFromTemplate(project.id, template));
  }, [project, currentChecklist]);

  if (!project || !draft) {
    return null;
  }

  const orderedSections = [...draft.structure.sections].sort((first, second) => first.order - second.order);

  const updateStructure = (updater: (structure: ChecklistStructure) => ChecklistStructure) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        structure: reorderStructure(updater(cloneChecklistStructure(current.structure))),
      };
    });
  };

  const saveDraft = async (patch?: Partial<ProjectChecklist>) => {
    const nextChecklist: ProjectChecklist = {
      ...draft,
      ...patch,
      structure: reorderStructure(draft.structure),
    };
    await upsertProjectChecklist(nextChecklist);
    setDraft(nextChecklist);
  };

  const applyTemplate = (template: ChecklistTemplate) => {
    const nextChecklist = createChecklistFromTemplate(project.id, template);
    setDraft({
      ...draft,
      templateId: template.id,
      structure: nextChecklist.structure,
      status: 'rascunho',
      releasedAt: null,
      submittedAt: null,
      reopenedAt: null,
      lastSavedAt: draft.lastSavedAt,
    });
  };

  const handleNotify = async () => {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/cliente` : '/cliente';
    const message = `Olá ${project.clientName}! Seu checklist está disponível no portal. Acesse ${link} e preencha para darmos início ao projeto.`;

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      return;
    }

    window.prompt('Copie a mensagem abaixo:', message);
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="panel">
          <div className="border-b border-[var(--line)] px-4 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[var(--text)]">Montagem do checklist</h2>
                <p className="mt-1 text-sm muted">
                  Organize secoes, tipos de resposta e regras antes de liberar para o cliente.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    updateStructure((structure) => ({
                      ...structure,
                      sections: [...structure.sections, createSection(structure.sections.length + 1)],
                    }))
                  }
                  className="h-12 border border-[var(--line)] bg-[var(--panel-alt)] px-4 text-sm font-medium"
                >
                  Nova secao
                </button>
                <button
                  type="button"
                  onClick={() => void saveDraft()}
                  className="inline-flex h-12 items-center justify-center gap-2 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)]"
                >
                  <Save size={16} />
                  Salvar checklist
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {orderedSections.length === 0 ? (
              <div className="panel-alt px-4 py-8 text-center text-sm muted">
                Nenhuma secao criada ainda. Adicione a primeira secao para montar o checklist.
              </div>
            ) : null}

            {orderedSections.map((section) => {
              const sectionItems = draft.structure.items
                .filter((item) => item.sectionId === section.id)
                .sort((first, second) => first.order - second.order);

              return (
                <div
                  key={section.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!dragItemId) {
                      return;
                    }

                    updateStructure((structure) => {
                      const items = structure.items.map((item) =>
                        item.id === dragItemId
                          ? { ...item, sectionId: section.id, order: sectionItems.length + 1 }
                          : item,
                      );
                      return { ...structure, items };
                    });
                    setDragItemId(null);
                  }}
                  className="border border-[var(--line)] bg-[var(--panel-alt)]"
                >
                  <div className="border-b border-[var(--line)] px-4 py-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
                        <input
                          className="field"
                          value={section.title}
                          onChange={(event) =>
                            updateStructure((structure) => ({
                              ...structure,
                              sections: structure.sections.map((item) =>
                                item.id === section.id ? { ...item, title: event.target.value } : item,
                              ),
                            }))
                          }
                        />
                        <input
                          className="field"
                          placeholder="Descricao opcional da secao"
                          value={section.description || ''}
                          onChange={(event) =>
                            updateStructure((structure) => ({
                              ...structure,
                              sections: structure.sections.map((item) =>
                                item.id === section.id
                                  ? { ...item, description: event.target.value || null }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateStructure((structure) => ({
                              ...structure,
                              sections: structure.sections.map((item) =>
                                item.id === section.id ? { ...item, collapsed: !item.collapsed } : item,
                              ),
                            }))
                          }
                          className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-medium"
                        >
                          {section.collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                          {section.collapsed ? 'Expandir' : 'Recolher'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStructure((structure) => ({
                              ...structure,
                              items: [
                                ...structure.items,
                                createItem(section.id, sectionItems.length + 1),
                              ],
                            }))
                          }
                          className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-medium"
                        >
                          <Plus size={16} />
                          Novo item
                        </button>
                        <button
                          type="button"
                          disabled={draft.structure.sections.length === 1}
                          onClick={() =>
                            updateStructure((structure) => ({
                              sections: structure.sections.filter((item) => item.id !== section.id),
                              items: structure.items.filter((item) => item.sectionId !== section.id),
                            }))
                          }
                          className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-medium disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Remover secao
                        </button>
                      </div>
                    </div>
                  </div>

                  {!section.collapsed ? (
                    <div className="space-y-4 p-4">
                      {sectionItems.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => setDragItemId(item.id)}
                          className="border border-[var(--line)] bg-[var(--panel)]"
                        >
                          <div className="border-b border-[var(--line)] px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 text-sm font-medium text-[var(--text)]">
                                <GripVertical size={15} className="text-[var(--muted)]" />
                                Item #{index + 1}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStructure((structure) => ({
                                      ...structure,
                                      items: [
                                        ...structure.items,
                                        {
                                          ...item,
                                          id: createId('checklist-item'),
                                          title: `${item.title} copia`,
                                          order: sectionItems.length + 1,
                                        },
                                      ],
                                    }))
                                  }
                                  className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel-alt)] px-3 text-sm font-medium"
                                >
                                  <Copy size={15} />
                                  Duplicar
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStructure((structure) => ({
                                      ...structure,
                                      items: structure.items.filter((entry) => entry.id !== item.id),
                                    }))
                                  }
                                  className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel-alt)] px-3 text-sm font-medium"
                                >
                                  <Trash2 size={15} />
                                  Remover
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
                            <input
                              className="field"
                              placeholder="Titulo do campo"
                              value={item.title}
                              onChange={(event) =>
                                updateStructure((structure) => ({
                                  ...structure,
                                  items: structure.items.map((entry) =>
                                    entry.id === item.id ? { ...entry, title: event.target.value } : entry,
                                  ),
                                }))
                              }
                            />
                            <select
                              className="field"
                              value={item.type}
                              onChange={(event) =>
                                updateStructure((structure) => ({
                                  ...structure,
                                  items: structure.items.map((entry) =>
                                    entry.id === item.id
                                      ? {
                                          ...entry,
                                          type: event.target.value as ChecklistFieldType,
                                          options:
                                            event.target.value === 'single_choice' ||
                                            event.target.value === 'multi_choice'
                                              ? entry.options.length > 0
                                                ? entry.options
                                                : [{ id: createId('checklist-option'), label: 'Opcao 1' }]
                                              : [],
                                        }
                                      : entry,
                                  ),
                                }))
                              }
                            >
                              {fieldTypeOptions.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>

                            <select
                              className="field"
                              value={item.sectionId}
                              onChange={(event) =>
                                updateStructure((structure) => ({
                                  ...structure,
                                  items: structure.items.map((entry) =>
                                    entry.id === item.id
                                      ? { ...entry, sectionId: event.target.value }
                                      : entry,
                                  ),
                                }))
                              }
                            >
                              {orderedSections.map((entry) => (
                                <option key={entry.id} value={entry.id}>
                                  {entry.title}
                                </option>
                              ))}
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                              <label className="panel-alt flex items-center justify-between px-3 py-3 text-sm">
                                Obrigatorio
                                <input
                                  type="checkbox"
                                  checked={item.required}
                                  onChange={(event) =>
                                    updateStructure((structure) => ({
                                      ...structure,
                                      items: structure.items.map((entry) =>
                                        entry.id === item.id ? { ...entry, required: event.target.checked } : entry,
                                      ),
                                    }))
                                  }
                                />
                              </label>
                              <input
                                className="field"
                                type="number"
                                min={1}
                                placeholder="Max arquivos"
                                value={item.maxFiles || ''}
                                onChange={(event) =>
                                  updateStructure((structure) => ({
                                    ...structure,
                                    items: structure.items.map((entry) =>
                                      entry.id === item.id
                                        ? {
                                            ...entry,
                                            maxFiles: event.target.value ? Number(event.target.value) : null,
                                          }
                                        : entry,
                                    ),
                                  }))
                                }
                              />
                            </div>

                            <textarea
                              className="field lg:col-span-2"
                              rows={2}
                              placeholder="Descricao de ajuda"
                              value={item.helpText || ''}
                              onChange={(event) =>
                                updateStructure((structure) => ({
                                  ...structure,
                                  items: structure.items.map((entry) =>
                                    entry.id === item.id
                                      ? { ...entry, helpText: event.target.value || null }
                                      : entry,
                                  ),
                                }))
                              }
                            />

                            {(item.type === 'single_choice' || item.type === 'multi_choice') && (
                              <textarea
                                className="field lg:col-span-2"
                                rows={3}
                                placeholder="Uma opcao por linha"
                                value={item.options.map((option) => option.label).join('\n')}
                                onChange={(event) =>
                                  updateStructure((structure) => ({
                                    ...structure,
                                    items: structure.items.map((entry) =>
                                      entry.id === item.id
                                        ? {
                                            ...entry,
                                            options: event.target.value
                                              .split('\n')
                                              .map((label) => label.trim())
                                              .filter(Boolean)
                                              .map((label, optionIndex) => ({
                                                id: entry.options[optionIndex]?.id || createId('checklist-option'),
                                                label,
                                              })),
                                          }
                                        : entry,
                                    ),
                                  }))
                                }
                              />
                            )}

                            {(item.type === 'file' || item.type === 'image_gallery') && (
                              <input
                                className="field lg:col-span-2"
                                placeholder="Formatos aceitos, separados por virgula"
                                value={item.acceptedFormats.join(', ')}
                                onChange={(event) =>
                                  updateStructure((structure) => ({
                                    ...structure,
                                    items: structure.items.map((entry) =>
                                      entry.id === item.id
                                        ? {
                                            ...entry,
                                            acceptedFormats: event.target.value
                                              .split(',')
                                              .map((format) => format.trim())
                                              .filter(Boolean),
                                          }
                                        : entry,
                                    ),
                                  }))
                                }
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="border-b border-[var(--line)] px-4 py-4">
            <h3 className="text-base font-semibold text-[var(--text)]">Salvar estrutura como template</h3>
            <p className="mt-1 text-sm muted">Guarde o checklist atual para reaproveitar em projetos futuros.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_220px]">
            <input
              className="field"
              placeholder="Nome do template"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
            />
            <button
              type="button"
              disabled={!templateName.trim()}
              onClick={() =>
                void saveChecklistTemplate({
                  id: createId('checklist-template'),
                  name: templateName.trim(),
                  projectType: project.type,
                  structure: reorderStructure(draft.structure),
                  createdBy: 'vexcoding',
                  createdAt: new Date().toISOString(),
                  isDefault: false,
                }).then(() => setTemplateName(''))
              }
              className="h-12 border border-[var(--line)] bg-[var(--panel-alt)] text-sm font-medium disabled:opacity-50"
            >
              Salvar template
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ChecklistStatus
          project={project}
          checklist={draft}
          responses={responses}
          onSaveDraft={() => void saveDraft({ status: 'rascunho' })}
          onRelease={() =>
            void saveDraft({
              status: 'liberado',
              releasedAt: new Date().toISOString(),
              reopenedAt: null,
            })
          }
          onNotify={() => void handleNotify()}
          onReopen={() =>
            void saveDraft({
              status: 'liberado',
              reopenedAt: new Date().toISOString(),
              submittedAt: null,
            })
          }
        />
        <ChecklistTemplates
          templates={templates}
          activeTemplateId={draft.templateId}
          onApplyTemplate={applyTemplate}
        />
        <div className="panel">
          <div className="border-b border-[var(--line)] px-4 py-4">
            <h3 className="text-base font-semibold text-[var(--text)]">Resumo rápido</h3>
            <p className="mt-1 text-sm muted">Estrutura atual pronta para o cliente preencher no portal.</p>
          </div>
          <div className="space-y-3 p-4">
            {orderedSections.map((section) => {
              const total = draft.structure.items.filter((item) => item.sectionId === section.id).length;
              return (
                <div key={section.id} className="panel-alt flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-medium text-[var(--text)]">{section.title}</span>
                  <span className="muted">{total} itens</span>
                </div>
              );
            })}
            {orderedSections.length === 0 ? (
              <div className="panel-alt px-4 py-4 text-sm muted">O template atual ainda não possui seções.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
