'use client';

import { getDemoWorkspace, saveDemoWorkspace, canUseStorage } from '@/lib/demo-store';
import { createId } from '@/lib/utils';
import type {
  ChecklistResponse,
  ChecklistResponseValue,
  ClientAccount,
  ClientPortalMessage,
  ClientPortalSnapshot,
  Project,
  ProjectChecklist,
  WorkspaceData,
} from '@/types/dashboard';

const DEMO_CLIENT_SESSION_KEY = 'vexcoding-demo-client-session-v1';

interface DemoClientSession {
  clientId: string;
  email: string;
  projectId: string;
  createdAt: string;
}

export const demoClientPassword = '123456';

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const sortByNewest = <T extends { createdAt?: string; updatedAt?: string }>(items: T[]) =>
  [...items].sort((left, right) => {
    const leftDate = left.updatedAt || left.createdAt || '';
    const rightDate = right.updatedAt || right.createdAt || '';
    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  });

const getStoredSession = (): DemoClientSession | null => {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(DEMO_CLIENT_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoClientSession;
  } catch {
    window.localStorage.removeItem(DEMO_CLIENT_SESSION_KEY);
    return null;
  }
};

const saveStoredSession = (session: DemoClientSession) => {
  if (canUseStorage()) {
    window.localStorage.setItem(DEMO_CLIENT_SESSION_KEY, JSON.stringify(session));
  }
};

const resolveClient = (workspace: WorkspaceData, session: DemoClientSession): ClientAccount | null =>
  workspace.clients.find((client) => client.id === session.clientId || normalizeEmail(client.email) === session.email) || null;

const resolveProject = (workspace: WorkspaceData, client: ClientAccount): Project | null =>
  workspace.projects.find((project) => project.id === client.projectId) || null;

const resolveChecklist = (workspace: WorkspaceData, projectId: string): ProjectChecklist | null =>
  [...workspace.projectChecklists]
    .filter((checklist) => checklist.projectId === projectId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] || null;

const resolveChecklistResponses = (workspace: WorkspaceData, checklistId: string): ChecklistResponse[] =>
  sortByNewest(
    workspace.checklistResponses
      .filter((response) => response.checklistId === checklistId)
      .map((response) => ({
        ...response,
        createdAt: response.updatedAt,
      })),
  ).map(({ createdAt: _createdAt, ...response }) => response);

const buildSnapshot = (workspace: WorkspaceData, session: DemoClientSession): ClientPortalSnapshot | null => {
  const client = resolveClient(workspace, session);
  if (!client) {
    return null;
  }

  const project = resolveProject(workspace, client);
  if (!project) {
    return null;
  }

  const checklist = resolveChecklist(workspace, project.id);
  const partners = workspace.partners;

  return {
    client,
    project,
    responsiblePartner: partners.find((partner) => project.partnerIds.includes(partner.id)) || null,
    partners,
    stages: [...workspace.clientStages]
      .filter((stage) => stage.projectId === project.id)
      .sort((left, right) => left.order - right.order),
    updates: sortByNewest(workspace.clientUpdates.filter((update) => update.projectId === project.id)),
    messages: sortByNewest(workspace.clientMessages.filter((message) => message.projectId === project.id)),
    documents: sortByNewest(workspace.clientDocuments.filter((document) => document.projectId === project.id)),
    checklist,
    checklistResponses: checklist ? resolveChecklistResponses(workspace, checklist.id) : [],
  };
};

const mutateWorkspace = (mutator: (workspace: WorkspaceData, session: DemoClientSession) => void) => {
  const session = getStoredSession();
  if (!session) {
    return null;
  }

  const workspace = getDemoWorkspace();
  mutator(workspace, session);
  saveDemoWorkspace(workspace);

  return buildSnapshot(workspace, session);
};

export const getDemoClientSession = () => getStoredSession();

export const clearDemoClientSession = () => {
  if (canUseStorage()) {
    window.localStorage.removeItem(DEMO_CLIENT_SESSION_KEY);
  }
};

export const signInDemoClient = (email: string, password: string) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || password.trim() !== demoClientPassword) {
    throw new Error('Credenciais invalidas.');
  }

  const workspace = getDemoWorkspace();
  const client = workspace.clients.find((item) => normalizeEmail(item.email) === normalizedEmail);

  if (!client) {
    throw new Error('Credenciais invalidas.');
  }

  const session: DemoClientSession = {
    clientId: client.id,
    email: normalizedEmail,
    projectId: client.projectId,
    createdAt: new Date().toISOString(),
  };

  saveStoredSession(session);
  return session;
};

export const getDemoClientSnapshot = () => {
  const session = getStoredSession();
  if (!session) {
    return null;
  }

  return buildSnapshot(getDemoWorkspace(), session);
};

export const sendDemoClientMessage = (text: string) =>
  mutateWorkspace((workspace, session) => {
    const client = resolveClient(workspace, session);
    if (!client) {
      return;
    }

    const nextMessage: ClientPortalMessage = {
      id: createId('message'),
      projectId: session.projectId,
      senderType: 'cliente',
      senderName: client.name,
      text,
      createdAt: new Date().toISOString(),
    };

    workspace.clientMessages.unshift(nextMessage);
  });

export const saveDemoClientChecklist = (
  responses: Array<{ itemId: string; value: ChecklistResponseValue }>,
  checklistPatch?: Partial<Pick<ProjectChecklist, 'status' | 'releasedAt' | 'submittedAt' | 'reopenedAt' | 'lastSavedAt'>>,
) =>
  mutateWorkspace((workspace, session) => {
    const checklist = resolveChecklist(workspace, session.projectId);
    if (!checklist) {
      return;
    }

    const now = new Date().toISOString();

    responses.forEach((response) => {
      const existing = workspace.checklistResponses.find(
        (item) => item.checklistId === checklist.id && item.itemId === response.itemId,
      );

      if (existing) {
        existing.value = response.value;
        existing.updatedAt = now;
        return;
      }

      workspace.checklistResponses.unshift({
        id: createId('checklist-response'),
        checklistId: checklist.id,
        itemId: response.itemId,
        value: response.value,
        updatedAt: now,
      });
    });

    const target = workspace.projectChecklists.find((item) => item.id === checklist.id);
    if (target) {
      Object.assign(target, checklistPatch || {});
      target.lastSavedAt = checklistPatch?.lastSavedAt || now;
    }
  });

export const requestDemoClientChecklistReopen = (checklistId: string) =>
  mutateWorkspace((workspace, session) => {
    const checklist = workspace.projectChecklists.find(
      (item) => item.id === checklistId && item.projectId === session.projectId,
    );
    const client = resolveClient(workspace, session);

    if (!checklist || !client) {
      return;
    }

    workspace.clientMessages.unshift({
      id: createId('message'),
      projectId: session.projectId,
      senderType: 'cliente',
      senderName: client.name,
      text: 'Solicito a reabertura do checklist para enviar ajustes.',
      createdAt: new Date().toISOString(),
    });
  });
