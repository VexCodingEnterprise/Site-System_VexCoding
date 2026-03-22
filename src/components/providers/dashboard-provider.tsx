'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createDemoWorkspace, fixedPartners } from '@/data/demo';
import {
  getDemoWorkspace,
  getStoredMode,
  resetDemoWorkspace,
  saveDemoWorkspace,
  setStoredMode,
} from '@/lib/demo-store';
import { officialSupabaseConfigError } from '@/lib/config';
import { createId } from '@/lib/utils';
import type {
  AppMode,
  Branch,
  ChecklistResponse,
  ChecklistResponseValue,
  ChecklistTemplate,
  ClientAccount,
  ClientPortalDocument,
  ClientPortalMessage,
  ClientPortalStage,
  ClientPortalUpdate,
  DashboardSession,
  FinanceEntry,
  Lead,
  Partner,
  Project,
  ProjectChecklist,
  ProjectDocument,
  ProjectStatusHistoryEntry,
  StageTemplate,
  Task,
  WorkspaceData,
  WorkspaceSettings,
} from '@/types/dashboard';

type ProjectDraft = Omit<Project, 'id' | 'createdAt' | 'concludedAt' | 'testimonial' | 'useAsCase'>;
type BranchDraft = Omit<Branch, 'id'>;
type TaskDraft = Omit<Task, 'id' | 'createdAt'>;
type FinanceDraft = Omit<FinanceEntry, 'id'>;
type DocumentDraft = Omit<ProjectDocument, 'id'>;
type UploadedDocument = Pick<ProjectDocument, 'name' | 'fileUrl' | 'filePath'>;
type ClientStageDraft = Omit<ClientPortalStage, 'id' | 'completedAt' | 'createdAt'>;
type ClientUpdateDraft = Omit<ClientPortalUpdate, 'id' | 'createdAt'>;
type ClientMessageDraft = Omit<ClientPortalMessage, 'id' | 'createdAt'>;
type ClientDocumentDraft = Omit<ClientPortalDocument, 'id' | 'createdAt'>;
type UploadedClientDocument = { name: string; fileUrl: string; filePath: string | null };
type ChecklistResponseDraft = { itemId: string; value: ChecklistResponseValue };

interface DashboardContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  workspace: WorkspaceData | null;
  session: DashboardSession;
  loading: boolean;
  actionLoading: boolean;
  error: string;
  notice: string;
  clearFeedback: () => void;
  resetDemo: () => void;
  reload: () => Promise<void>;
  updateLeadStatus: (leadId: string, status: Lead['status']) => Promise<void>;
  convertLeadToProject: (leadId: string, project: ProjectDraft) => Promise<void>;
  createProject: (project: ProjectDraft) => Promise<void>;
  updateProject: (projectId: string, patch: Partial<Project>) => Promise<void>;
  createBranch: (branch: BranchDraft) => Promise<void>;
  createTask: (task: TaskDraft) => Promise<void>;
  updateTask: (taskId: string, patch: Partial<Task>) => Promise<void>;
  createFinanceEntry: (entry: FinanceDraft) => Promise<void>;
  createDocument: (document: DocumentDraft) => Promise<void>;
  uploadDocumentFile: (projectId: string, file: File) => Promise<UploadedDocument>;
  createClientAccess: (projectId: string, name: string, email: string) => Promise<{ temporaryPassword: string | null }>;
  regenerateClientPassword: (clientId: string) => Promise<{ temporaryPassword: string | null }>;
  createClientStage: (stage: ClientStageDraft) => Promise<void>;
  updateClientStage: (stageId: string, patch: Partial<ClientPortalStage>) => Promise<void>;
  deleteClientStage: (stageId: string) => Promise<void>;
  reorderClientStages: (projectId: string, stageIds: string[]) => Promise<void>;
  completeClientStage: (stageId: string, updateTitle: string, updateDescription?: string) => Promise<void>;
  createClientUpdate: (update: ClientUpdateDraft) => Promise<void>;
  createClientMessage: (message: ClientMessageDraft) => Promise<void>;
  createClientDocument: (document: ClientDocumentDraft) => Promise<void>;
  uploadClientDocumentFile: (projectId: string, file: File) => Promise<UploadedClientDocument>;
  upsertProjectChecklist: (checklist: ProjectChecklist) => Promise<void>;
  saveChecklistResponses: (
    checklistId: string,
    responses: ChecklistResponseDraft[],
    checklistPatch?: Partial<Pick<ProjectChecklist, 'status' | 'releasedAt' | 'submittedAt' | 'reopenedAt' | 'lastSavedAt'>>,
  ) => Promise<void>;
  saveChecklistTemplate: (template: ChecklistTemplate) => Promise<void>;
  replaceClientStages: (projectId: string, stages: ClientStageDraft[]) => Promise<void>;
  saveStageTemplate: (template: StageTemplate) => Promise<void>;
  updateProjectCase: (projectId: string, testimonial: string, useAsCase: boolean) => Promise<void>;
  updatePreferences: (patch: Partial<Pick<Partner, 'notificationsEmail' | 'notificationsBrowser' | 'themePreference'>>) => Promise<void>;
  changePassword: (nextPassword: string) => Promise<void>;
  saveSettings: (settings: WorkspaceSettings) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const api = {
  async loadOfficialWorkspace() {
    const response = await fetch('/api/workspace', { cache: 'no-store' });
    const payload = (await response.json()) as { workspace?: WorkspaceData; message?: string };
    if (!response.ok || !payload.workspace) {
      throw new Error(payload.message || 'Nao foi possivel carregar o modo oficial.');
    }
    return payload.workspace;
  },
  async postOfficial(body: unknown) {
    const response = await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as { ok?: boolean; message?: string; result?: any };
    if (!response.ok) {
      throw new Error(payload.message || 'Nao foi possivel executar a acao oficial.');
    }
    return payload;
  },
  async uploadOfficialDocument(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const payload = (await response.json()) as {
      fileUrl?: string;
      filePath?: string | null;
      name?: string;
      message?: string;
    };

    if (!response.ok || !payload.fileUrl) {
      throw new Error(payload.message || 'Nao foi possivel enviar o documento.');
    }

    return {
      name: payload.name || file.name,
      fileUrl: payload.fileUrl,
      filePath: payload.filePath || null,
    };
  },
  async uploadOfficialClientDocument(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);

    const response = await fetch('/api/client-portal/upload', {
      method: 'POST',
      body: formData,
    });

    const payload = (await response.json()) as {
      fileUrl?: string;
      filePath?: string | null;
      name?: string;
      message?: string;
    };

    if (!response.ok || !payload.fileUrl) {
      throw new Error(payload.message || 'Nao foi possivel enviar o documento do cliente.');
    }

    return {
      name: payload.name || file.name,
      fileUrl: payload.fileUrl,
      filePath: payload.filePath || null,
    };
  },
};

export function DashboardProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: DashboardSession;
}) {
  const [mode, setModeState] = useState<AppMode>('demo');
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadWorkspace = useCallback(async (nextMode: AppMode, options?: { allowFallbackToDemo?: boolean }) => {
    setLoading(true);
    setError('');

    try {
      const data = nextMode === 'official' ? await api.loadOfficialWorkspace() : getDemoWorkspace();
      setWorkspace(data);
      return true;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os dados.');
      if (nextMode === 'official' && options?.allowFallbackToDemo) {
        setModeState('demo');
        setStoredMode('demo');
        setWorkspace(getDemoWorkspace());
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedMode = getStoredMode();
    setModeState(storedMode);
    void loadWorkspace(storedMode, { allowFallbackToDemo: true });
  }, [loadWorkspace]);

  const persistDemoWorkspace = (updater: (current: WorkspaceData) => WorkspaceData) => {
    setWorkspace((current) => {
      const base = current || createDemoWorkspace();
      const next = updater(base);
      saveDemoWorkspace(next);
      return next;
    });
  };

  const runAction = async (handler: () => Promise<void> | void, successMessage: string) => {
    setActionLoading(true);
    setError('');

    try {
      await handler();
      setNotice(successMessage);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Nao foi possivel executar a acao.');
    } finally {
      setActionLoading(false);
    }
  };

  const clearFeedback = () => {
    setError('');
    setNotice('');
  };

  const setMode = async (nextMode: AppMode) => {
    clearFeedback();

    if (nextMode === mode) {
      return;
    }

    if (nextMode === 'official') {
      const configError = officialSupabaseConfigError();
      if (configError) {
        setError(configError);
        return;
      }
    }

    const loaded = await loadWorkspace(nextMode);
    if (!loaded) {
      return;
    }

    setModeState(nextMode);
    setStoredMode(nextMode);
  };

  const reload = async () => {
    await loadWorkspace(mode);
  };

  const resetDemo = () => {
    resetDemoWorkspace();
    setWorkspace(getDemoWorkspace());
    setNotice('Dados demo resetados com sucesso.');
  };

  const updateLeadStatus = async (leadId: string, status: Lead['status']) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'lead-status', leadId, status } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        leads: current.leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
      }));
    }, 'Status do lead atualizado.');
  };

  const createStatusHistory = (
    projectId: string,
    status: Project['status'],
    changedBy: DashboardSession['partnerId'],
  ): ProjectStatusHistoryEntry => ({
    id: createId('history'),
    projectId,
    status,
    changedAt: new Date().toISOString(),
    changedBy,
  });

  const convertLeadToProject = async (leadId: string, project: ProjectDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'lead-convert', leadId, project } });
        await loadWorkspace('official');
        return;
      }

      const createdAt = new Date().toISOString();
      const projectId = createId('project');
      persistDemoWorkspace((current) => ({
        ...current,
        leads: current.leads.map((lead) =>
          lead.id === leadId
            ? { ...lead, status: 'Convertido', convertedAt: createdAt, projectId }
            : lead,
        ),
        projects: [
          {
            id: projectId,
            ...project,
            createdAt,
            concludedAt: null,
            testimonial: null,
            useAsCase: false,
          },
          ...current.projects,
        ],
        statusHistory: [
          createStatusHistory(projectId, project.status, session.partnerId),
          ...current.statusHistory,
        ],
      }));
    }, 'Lead convertido em projeto.');
  };

  const createProject = async (project: ProjectDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'project-create', project } });
        await loadWorkspace('official');
        return;
      }

      const projectId = createId('project');
      const createdAt = new Date().toISOString();
      persistDemoWorkspace((current) => ({
        ...current,
        projects: [
          {
            id: projectId,
            ...project,
            createdAt,
            concludedAt: null,
            testimonial: null,
            useAsCase: false,
          },
          ...current.projects,
        ],
        statusHistory: [
          createStatusHistory(projectId, project.status, session.partnerId),
          ...current.statusHistory,
        ],
      }));
    }, 'Projeto criado com sucesso.');
  };

  const updateProject = async (projectId: string, patch: Partial<Project>) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'project-update', projectId, patch } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => {
        const nextHistory =
          typeof patch.status !== 'undefined'
            ? [createStatusHistory(projectId, patch.status, session.partnerId), ...current.statusHistory]
            : current.statusHistory;

        return {
          ...current,
          projects: current.projects.map((project) =>
            project.id === projectId ? { ...project, ...patch } : project,
          ),
          statusHistory: nextHistory,
        };
      });
    }, 'Projeto atualizado.');
  };

  const createBranch = async (branch: BranchDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'branch-create', branch } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        branches: [{ id: createId('branch'), ...branch }, ...current.branches],
      }));
    }, 'Ramificacao criada.');
  };

  const createTask = async (task: TaskDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'task-create', task } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        tasks: [{ id: createId('task'), createdAt: new Date().toISOString(), ...task }, ...current.tasks],
      }));
    }, 'Tarefa criada.');
  };

  const updateTask = async (taskId: string, patch: Partial<Task>) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'task-update', taskId, patch } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
      }));
    }, 'Tarefa atualizada.');
  };

  const createFinanceEntry = async (entry: FinanceDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'finance-create', entry } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        finance: [{ id: createId('finance'), ...entry }, ...current.finance],
      }));
    }, 'Lancamento financeiro criado.');
  };

  const createDocument = async (document: DocumentDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'document-create', document } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        documents: [{ id: createId('document'), ...document }, ...current.documents],
      }));
    }, 'Documento adicionado.');
  };

  const uploadDocumentFile = async (projectId: string, file: File) => {
    if (mode === 'demo') {
      throw new Error('No modo demo use um link manual. Upload de arquivo depende do Supabase Storage.');
    }

    return api.uploadOfficialDocument(projectId, file);
  };

  const createClientAccess = async (projectId: string, name: string, email: string) => {
    if (mode === 'official') {
      const payload = await api.postOfficial({
        scope: 'workspace',
        action: { type: 'client-access-create', projectId, name, email },
      });
      await loadWorkspace('official');
      return { temporaryPassword: payload.result?.temporaryPassword || null };
    }

    let temporaryPassword: string | null = null;
    await runAction(async () => {
      temporaryPassword = Math.random().toString(36).slice(-10) + 'A1!';
      persistDemoWorkspace((current) => {
        const existing = current.clients.find((client) => client.projectId === projectId);
        if (existing) {
          return {
            ...current,
            clients: current.clients.map((client) =>
              client.projectId === projectId
                ? { ...client, name, email, accessStatus: 'Acesso criado' }
                : client,
            ),
          };
        }

        return {
          ...current,
          clients: [
            {
              id: createId('client'),
              userId: null,
              projectId,
              name,
              email,
              createdAt: new Date().toISOString(),
              accessStatus: 'Acesso criado',
            },
            ...current.clients,
          ],
        };
      });
    }, 'Acesso do cliente criado.');

    return { temporaryPassword };
  };

  const regenerateClientPassword = async (clientId: string) => {
    if (mode === 'official') {
      const payload = await api.postOfficial({
        scope: 'workspace',
        action: { type: 'client-access-regenerate-password', clientId },
      });
      return { temporaryPassword: payload.result?.temporaryPassword || null };
    }

    let temporaryPassword: string | null = null;
    await runAction(async () => {
      temporaryPassword = Math.random().toString(36).slice(-10) + 'A1!';
    }, 'Senha regenerada para o cliente.');

    return { temporaryPassword };
  };

  const createClientStage = async (stage: ClientStageDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'client-stage-create', stage } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        clientStages: [
          {
            id: createId('stage'),
            ...stage,
            completedAt: null,
            createdAt: new Date().toISOString(),
          },
          ...current.clientStages,
        ],
      }));
    }, 'Etapa do cliente criada.');
  };

  const updateClientStage = async (stageId: string, patch: Partial<ClientPortalStage>) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'client-stage-update', stageId, patch } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        clientStages: current.clientStages.map((stage) => (stage.id === stageId ? { ...stage, ...patch } : stage)),
      }));
    }, 'Etapa atualizada.');
  };

  const deleteClientStage = async (stageId: string) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'client-stage-delete', stageId } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        clientStages: current.clientStages.filter((stage) => stage.id !== stageId),
      }));
    }, 'Etapa removida.');
  };

  const reorderClientStages = async (projectId: string, stageIds: string[]) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'client-stage-reorder', projectId, stageIds } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        clientStages: current.clientStages.map((stage) => {
          const index = stageIds.indexOf(stage.id);
          return index >= 0 ? { ...stage, order: index + 1 } : stage;
        }),
      }));
    }, 'Etapas reordenadas.');
  };

  const completeClientStage = async (stageId: string, updateTitle: string, updateDescription?: string) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({
          scope: 'workspace',
          action: { type: 'client-stage-complete', stageId, updateTitle, updateDescription },
        });
        await loadWorkspace('official');
        return;
      }

      const completedAt = new Date().toISOString();
      persistDemoWorkspace((current) => {
        const target = current.clientStages.find((stage) => stage.id === stageId);
        return {
          ...current,
          clientStages: current.clientStages.map((stage) =>
            stage.id === stageId ? { ...stage, status: 'concluida', completedAt } : stage,
          ),
          clientUpdates: target
            ? [
                {
                  id: createId('update'),
                  projectId: target.projectId,
                  title: updateTitle,
                  description: updateDescription || target.description,
                  icon: 'check',
                  createdAt: completedAt,
                },
                ...current.clientUpdates,
              ]
            : current.clientUpdates,
        };
      });
    }, 'Etapa concluida e feed atualizado.');
  };

  const createClientUpdate = async (update: ClientUpdateDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'client-update-create', update } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        clientUpdates: [{ id: createId('update'), ...update, createdAt: new Date().toISOString() }, ...current.clientUpdates],
      }));
    }, 'Atualizacao enviada ao cliente.');
  };

  const createClientMessage = async (message: ClientMessageDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'client-message-create', message } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        clientMessages: [{ id: createId('message'), ...message, createdAt: new Date().toISOString() }, ...current.clientMessages],
      }));
    }, 'Mensagem enviada ao cliente.');
  };

  const createClientDocument = async (document: ClientDocumentDraft) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'client-document-create', document } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        clientDocuments: [{ id: createId('client-document'), ...document, createdAt: new Date().toISOString() }, ...current.clientDocuments],
      }));
    }, 'Documento do cliente adicionado.');
  };

  const uploadClientDocumentFile = async (projectId: string, file: File) => {
    if (mode === 'demo') {
      throw new Error('No modo demo use um link manual para os documentos do cliente.');
    }

    return api.uploadOfficialClientDocument(projectId, file);
  };

  const upsertProjectChecklist = async (checklist: ProjectChecklist) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'project-checklist-upsert', checklist } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => {
        const existing = current.projectChecklists.some((item) => item.id === checklist.id);
        return {
          ...current,
          projectChecklists: existing
            ? current.projectChecklists.map((item) => (item.id === checklist.id ? checklist : item))
            : [checklist, ...current.projectChecklists],
        };
      });
    }, 'Checklist salvo.');
  };

  const saveChecklistResponses = async (
    checklistId: string,
    responses: ChecklistResponseDraft[],
    checklistPatch?: Partial<Pick<ProjectChecklist, 'status' | 'releasedAt' | 'submittedAt' | 'reopenedAt' | 'lastSavedAt'>>,
  ) => {
    await runAction(async () => {
      const now = new Date().toISOString();

      if (mode === 'official') {
        await api.postOfficial({
          scope: 'workspace',
          action: {
            type: 'checklist-responses-save',
            checklistId,
            responses,
            checklistPatch: {
              ...checklistPatch,
              lastSavedAt: checklistPatch?.lastSavedAt || now,
            },
          },
        });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => {
        const nextResponses = [...current.checklistResponses];

        responses.forEach((response) => {
          const existing = nextResponses.find(
            (item) => item.checklistId === checklistId && item.itemId === response.itemId,
          );

          if (existing) {
            existing.value = response.value;
            existing.updatedAt = now;
          } else {
            nextResponses.unshift({
              id: createId('checklist-response'),
              checklistId,
              itemId: response.itemId,
              value: response.value,
              updatedAt: now,
            });
          }
        });

        return {
          ...current,
          checklistResponses: nextResponses,
          projectChecklists: current.projectChecklists.map((item) =>
            item.id === checklistId
              ? {
                  ...item,
                  ...checklistPatch,
                  lastSavedAt: checklistPatch?.lastSavedAt || now,
                }
              : item,
          ),
        };
      });
    }, 'Checklist atualizado.');
  };

  const saveChecklistTemplate = async (template: ChecklistTemplate) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'checklist-template-upsert', template } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => {
        const existing = current.checklistTemplates.some((item) => item.id === template.id);
        return {
          ...current,
          checklistTemplates: existing
            ? current.checklistTemplates.map((item) => (item.id === template.id ? template : item))
            : [template, ...current.checklistTemplates],
        };
      });
    }, 'Template de checklist salvo.');
  };

  const replaceClientStages = async (projectId: string, stages: ClientStageDraft[]) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'client-stages-replace', projectId, stages } });
        await loadWorkspace('official');
        return;
      }

      const now = new Date().toISOString();
      persistDemoWorkspace((current) => ({
        ...current,
        clientStages: [
          ...current.clientStages.filter((stage) => stage.projectId !== projectId),
          ...stages.map((stage) => ({
            id: createId('stage'),
            ...stage,
            createdAt: now,
            completedAt: stage.status === 'concluida' ? now : null,
          })),
        ].sort((first, second) => first.order - second.order),
      }));
    }, 'Etapas do portal atualizadas.');
  };

  const saveStageTemplate = async (template: StageTemplate) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'workspace', action: { type: 'stage-template-upsert', template } });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => {
        const existing = current.stageTemplates.some((item) => item.id === template.id);
        return {
          ...current,
          stageTemplates: existing
            ? current.stageTemplates.map((item) => (item.id === template.id ? template : item))
            : [template, ...current.stageTemplates],
        };
      });
    }, 'Template de etapas salvo.');
  };

  const updateProjectCase = async (projectId: string, testimonial: string, useAsCase: boolean) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({
          scope: 'workspace',
          action: { type: 'project-testimonial', projectId, testimonial, useAsCase },
        });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        projects: current.projects.map((project) =>
          project.id === projectId ? { ...project, testimonial, useAsCase } : project,
        ),
      }));
    }, 'Projeto concluido atualizado.');
  };

  const updatePreferences = async (
    patch: Partial<Pick<Partner, 'notificationsEmail' | 'notificationsBrowser' | 'themePreference'>>,
  ) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'preferences', patch });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({
        ...current,
        partners: current.partners.map((partner) =>
          partner.id === session.partnerId ? { ...partner, ...patch } : partner,
        ),
      }));
    }, 'Preferencias atualizadas.');
  };

  const changePassword = async (nextPassword: string) => {
    await runAction(async () => {
      if (mode === 'demo') {
        throw new Error('No modo demo a senha permanece fixa em 123456.');
      }

      await api.postOfficial({ scope: 'password', nextPassword });
    }, 'Senha atualizada com sucesso.');
  };

  const saveSettings = async (settings: WorkspaceSettings) => {
    await runAction(async () => {
      if (mode === 'official') {
        await api.postOfficial({ scope: 'settings', settings });
        await loadWorkspace('official');
        return;
      }

      persistDemoWorkspace((current) => ({ ...current, settings }));
    }, 'Configuracoes salvas.');
  };

  const value: DashboardContextValue = {
    mode,
    setMode,
    workspace,
    session,
    loading,
    actionLoading,
    error,
    notice,
    clearFeedback,
    resetDemo,
    reload,
    updateLeadStatus,
    convertLeadToProject,
    createProject,
    updateProject,
    createBranch,
    createTask,
    updateTask,
    createFinanceEntry,
    createDocument,
    uploadDocumentFile,
    createClientAccess,
    regenerateClientPassword,
    createClientStage,
    updateClientStage,
    deleteClientStage,
    reorderClientStages,
    completeClientStage,
    createClientUpdate,
    createClientMessage,
    createClientDocument,
    uploadClientDocumentFile,
    upsertProjectChecklist,
    saveChecklistResponses,
    saveChecklistTemplate,
    replaceClientStages,
    saveStageTemplate,
    updateProjectCase,
    updatePreferences,
    changePassword,
    saveSettings,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard precisa ser usado dentro de DashboardProvider.');
  }
  return context;
};
