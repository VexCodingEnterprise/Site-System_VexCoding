import 'server-only';

import type {
  Branch,
  ChecklistResponseValue,
  ChecklistResponse,
  ChecklistStructure,
  ChecklistTemplate,
  ClientAccount,
  ClientPortalDocument,
  ClientPortalMessage,
  ClientPortalSnapshot,
  ClientPortalStage,
  ClientPortalUpdate,
  FinanceEntry,
  Lead,
  Partner,
  PartnerId,
  Project,
  ProjectChecklist,
  ProjectDocument,
  ProjectStatusHistoryEntry,
  StageTemplate,
  StageTemplateStep,
  Task,
  WorkspaceData,
  WorkspaceSettings,
} from '@/types/dashboard';
import { publicEnv } from '@/lib/config';
import { createId, sanitizeFileName } from '@/lib/utils';
import { getPasswordHashCandidates, hashPassword } from '@/lib/server/auth';
import { assertOfficialMode } from '@/lib/server/supabase-admin';

const TABLES = {
  partners: 'partners',
  leads: 'leads',
  projects: 'projects',
  statusHistory: 'project_status_history',
  branches: 'ramificacoes',
  tasks: 'tarefas',
  finance: 'financeiro',
  documents: 'project_documents',
  clients: 'clientes',
  clientStages: 'etapas_projeto',
  clientUpdates: 'atualizacoes_projeto',
  clientMessages: 'mensagens_projeto',
  clientDocuments: 'documentos_projeto',
  checklistTemplates: 'checklist_templates',
  projectChecklists: 'checklists_projeto',
  checklistResponses: 'checklist_respostas',
  stageTemplates: 'etapas_templates',
  settings: 'workspace_settings',
};

const defaultOfficialPartners = [
  {
    username: 'rafael',
    display_name: 'Rafael Nogueira',
    role: 'Socio de produto',
    email: 'rafael@vexcoding.com',
    avatar_color: '#0A0A0A',
    password_hash: hashPassword('rafael', '123456'),
    notifications_email: true,
    notifications_browser: true,
    theme_preference: 'dark',
  },
  {
    username: 'lourenzo',
    display_name: 'Lourenzo Martins',
    role: 'Socio de operacoes',
    email: 'lourenzo@vexcoding.com',
    avatar_color: '#444444',
    password_hash: hashPassword('lourenzo', '123456'),
    notifications_email: true,
    notifications_browser: true,
    theme_preference: 'light',
  },
] as const;

type ClientRow = {
  id: string;
  user_id: string | null;
  projeto_id: string;
  nome: string;
  email: string;
};

type ExistingClientRow = {
  id: string;
  user_id: string | null;
};

type StageRow = {
  id: string;
  projeto_id: string;
  descricao: string | null;
};

type SupabaseLikeError = {
  message?: string | null;
  details?: string | null;
};

const getOfficialDatabaseErrorMessage = (error: SupabaseLikeError | null | undefined, fallback: string) => {
  if (!error) {
    return fallback;
  }

  const rawMessage = String(error.message || error.details || fallback);

  if (
    rawMessage.includes('schema cache') ||
    rawMessage.includes('does not exist') ||
    rawMessage.includes('relation') ||
    rawMessage.includes("Could not find the table 'public.partners'")
  ) {
    return 'As tabelas do Supabase oficial ainda nao existem nesse projeto. Rode o arquivo supabase/schema.sql no SQL Editor do projeto conectado e tente novamente.';
  }

  if (rawMessage.includes('Bucket not found')) {
    return `O bucket ${publicEnv.projectDocumentsBucket} ainda nao existe no Supabase Storage.`;
  }

  return rawMessage;
};

const throwOfficialDatabaseError = (error: SupabaseLikeError | null | undefined, fallback: string): never => {
  throw new Error(getOfficialDatabaseErrorMessage(error, fallback));
};

const orderByDateDesc = <T extends { date?: string; createdAt?: string; created_at?: string; updatedAt?: string }>(items: T[]) =>
  [...items].sort((a, b) => {
    const first = a.date || a.createdAt || a.created_at || a.updatedAt || '';
    const second = b.date || b.createdAt || b.created_at || b.updatedAt || '';
    return new Date(second).getTime() - new Date(first).getTime();
  });

const mapLead = (row: Record<string, unknown>): Lead => ({
  id: String(row.id),
  name: String(row.nome),
  email: String(row.email),
  projectType: String(row.tipo_projeto),
  message: String(row.mensagem),
  status: row.status as Lead['status'],
  createdAt: String(row.criado_em),
  convertedAt: (row.convertido_em as string | null) || null,
  projectId: (row.projeto_id as string | null) || null,
});

const mapPartner = (row: Record<string, unknown>): Partner => ({
  id: row.username as Partner['id'],
  username: String(row.username),
  displayName: String(row.display_name),
  role: String(row.role),
  email: String(row.email),
  avatarColor: String(row.avatar_color || '#0A0A0A'),
  passwordHash: String(row.password_hash),
  notificationsEmail: Boolean(row.notifications_email),
  notificationsBrowser: Boolean(row.notifications_browser),
  themePreference: (row.theme_preference as Partner['themePreference']) || 'system',
  createdAt: String(row.criado_em),
});

const mapProject = (row: Record<string, unknown>): Project => ({
  id: String(row.id),
  name: String(row.nome),
  clientName: String(row.cliente_nome),
  clientEmail: String(row.cliente_email),
  company: String(row.empresa || ''),
  type: String(row.tipo),
  description: String(row.descricao),
  valueTotal: Number(row.valor_total || 0),
  valueReceived: Number(row.valor_recebido || 0),
  dueDate: String(row.prazo),
  status: row.status as Project['status'],
  partnerIds: ((row.socios_ids as string[]) || []) as Project['partnerIds'],
  createdAt: String(row.criado_em),
  concludedAt: (row.concluido_em as string | null) || null,
  testimonial: (row.depoimento as string | null) || null,
  useAsCase: Boolean(row.usar_como_case),
});

const mapStatusHistory = (row: Record<string, unknown>): ProjectStatusHistoryEntry => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  status: row.status as ProjectStatusHistoryEntry['status'],
  changedAt: String(row.alterado_em),
  changedBy: row.alterado_por as ProjectStatusHistoryEntry['changedBy'],
});

const mapBranch = (row: Record<string, unknown>): Branch => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  name: String(row.nome),
  order: Number(row.ordem || 0),
});

const mapTask = (row: Record<string, unknown>): Task => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  branchId: String(row.ramificacao_id),
  title: String(row.titulo),
  description: String(row.descricao || ''),
  assigneeId: row.responsavel_id as Task['assigneeId'],
  dueDate: String(row.prazo),
  priority: row.prioridade as Task['priority'],
  status: row.status as Task['status'],
  createdAt: String(row.criado_em),
});

const mapFinance = (row: Record<string, unknown>): FinanceEntry => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  description: String(row.descricao),
  value: Number(row.valor || 0),
  type: row.tipo as FinanceEntry['type'],
  status: row.status as FinanceEntry['status'],
  date: String(row.data),
});

const mapDocument = (row: Record<string, unknown>): ProjectDocument => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  name: String(row.nome),
  fileUrl: String(row.file_url || ''),
  filePath: (row.file_path as string | null) || null,
  uploadedAt: String(row.criado_em),
});

const mapSettings = (row?: Record<string, unknown> | null): WorkspaceSettings => ({
  resendEnabled: Boolean(row?.resend_enabled),
  resendFromEmail: String(row?.resend_from_email || 'contato@vexcoding.com'),
});

const mapClient = (row: Record<string, unknown>): ClientAccount => ({
  id: String(row.id),
  userId: (row.user_id as string | null) || null,
  projectId: String(row.projeto_id),
  name: String(row.nome),
  email: String(row.email),
  createdAt: String(row.criado_em),
  portalPassword: null,
  accessStatus: (row.user_id ? 'Acesso criado' : 'Aguardando criacao') as ClientAccount['accessStatus'],
});

const mapClientStage = (row: Record<string, unknown>): ClientPortalStage => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  name: String(row.nome),
  description: (row.descricao as string | null) || null,
  dueDate: String(row.data_prevista),
  status: row.status as ClientPortalStage['status'],
  order: Number(row.ordem || 0),
  completedAt: (row.concluida_em as string | null) || null,
  createdAt: String(row.criado_em),
});

const mapClientUpdate = (row: Record<string, unknown>): ClientPortalUpdate => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  title: String(row.titulo),
  description: (row.descricao as string | null) || null,
  icon: (row.icone as ClientPortalUpdate['icon']) || 'check',
  createdAt: String(row.criado_em),
});

const mapClientMessage = (row: Record<string, unknown>): ClientPortalMessage => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  senderType: row.remetente_tipo as ClientPortalMessage['senderType'],
  senderName: String(row.remetente_nome),
  text: String(row.texto),
  createdAt: String(row.criado_em),
});

const mapClientDocument = (row: Record<string, unknown>): ClientPortalDocument => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  name: String(row.nome),
  kind: row.tipo as ClientPortalDocument['kind'],
  url: String(row.url || ''),
  filePath: (row.file_path as string | null) || null,
  createdAt: String(row.criado_em),
});

const mapChecklistTemplate = (row: Record<string, unknown>): ChecklistTemplate => ({
  id: String(row.id),
  name: String(row.nome),
  projectType: String(row.tipo_projeto),
  structure: row.estrutura as ChecklistStructure,
  createdBy: String(row.criado_por),
  createdAt: String(row.criado_em),
  isDefault: Boolean(row.is_default),
});

const mapProjectChecklist = (row: Record<string, unknown>): ProjectChecklist => ({
  id: String(row.id),
  projectId: String(row.projeto_id),
  templateId: (row.template_id as string | null) || null,
  structure: row.estrutura as ChecklistStructure,
  status: row.status as ProjectChecklist['status'],
  releasedAt: (row.liberado_em as string | null) || null,
  submittedAt: (row.enviado_em as string | null) || null,
  createdAt: String(row.criado_em),
  reopenedAt: (row.reaberto_em as string | null) || null,
  lastSavedAt: (row.ultimo_salvamento_em as string | null) || null,
});

const mapChecklistResponse = (row: Record<string, unknown>): ChecklistResponse => ({
  id: String(row.id),
  checklistId: String(row.checklist_id),
  itemId: String(row.item_id),
  value: row.valor as ChecklistResponse['value'],
  updatedAt: String(row.atualizado_em),
});

const mapStageTemplate = (row: Record<string, unknown>): StageTemplate => ({
  id: String(row.id),
  name: String(row.nome),
  projectType: String(row.tipo_projeto),
  steps: (row.etapas as StageTemplateStep[]) || [],
  createdBy: String(row.criado_por),
  createdAt: String(row.criado_em),
  isDefault: Boolean(row.is_default),
});

const createSignedDocumentUrl = async (filePath: string | null) => {
  if (!filePath) {
    return '';
  }

  const supabase = assertOfficialMode();
  const { data, error } = await supabase.storage
    .from(publicEnv.projectDocumentsBucket)
    .createSignedUrl(filePath, 60 * 60 * 12);

  if (error) {
    return '';
  }

  return data.signedUrl;
};

const createSignedClientDocumentUrl = async (filePath: string | null) => {
  if (!filePath) {
    return '';
  }

  const supabase = assertOfficialMode();
  const { data, error } = await supabase.storage
    .from(publicEnv.projectDocumentsBucket)
    .createSignedUrl(filePath, 60 * 60 * 12);

  if (error) {
    return '';
  }

  return data.signedUrl;
};

const mapDocumentAsync = async (row: Record<string, unknown>): Promise<ProjectDocument> => {
  const mapped = mapDocument(row);

  if (!mapped.filePath) {
    return mapped;
  }

  const signedUrl = await createSignedDocumentUrl(mapped.filePath);
  return {
    ...mapped,
    fileUrl: signedUrl || mapped.fileUrl,
  };
};

const mapClientDocumentAsync = async (row: Record<string, unknown>): Promise<ClientPortalDocument> => {
  const mapped = mapClientDocument(row);

  if (!mapped.filePath) {
    return mapped;
  }

  const signedUrl = await createSignedClientDocumentUrl(mapped.filePath);
  return {
    ...mapped,
    url: signedUrl || mapped.url,
  };
};

const insertStatusHistory = async (
  projectId: string,
  status: Project['status'],
  actorId: PartnerId,
  changedAt = new Date().toISOString(),
) => {
  const supabase = assertOfficialMode();
  const { error } = await supabase.from(TABLES.statusHistory).insert({
    id: createId('history'),
    projeto_id: projectId,
    status,
    alterado_em: changedAt,
    alterado_por: actorId,
  });

  if (error) {
    throw new Error(error.message);
  }
};

export const getOfficialWorkspace = async (): Promise<WorkspaceData> => {
  const supabase = assertOfficialMode();

  const [
    partnersRes,
    leadsRes,
    projectsRes,
    historyRes,
    branchesRes,
    tasksRes,
    financeRes,
    documentsRes,
    clientsRes,
    clientStagesRes,
    clientUpdatesRes,
    clientMessagesRes,
    clientDocumentsRes,
    checklistTemplatesRes,
    projectChecklistsRes,
    checklistResponsesRes,
    stageTemplatesRes,
    settingsRes,
  ] =
    await Promise.all([
      supabase.from(TABLES.partners).select('*').order('display_name', { ascending: true }),
      supabase.from(TABLES.leads).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.projects).select('*').order('prazo', { ascending: true }),
      supabase.from(TABLES.statusHistory).select('*').order('alterado_em', { ascending: false }),
      supabase.from(TABLES.branches).select('*').order('ordem', { ascending: true }),
      supabase.from(TABLES.tasks).select('*').order('prazo', { ascending: true }),
      supabase.from(TABLES.finance).select('*').order('data', { ascending: false }),
      supabase.from(TABLES.documents).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.clients).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.clientStages).select('*').order('ordem', { ascending: true }),
      supabase.from(TABLES.clientUpdates).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.clientMessages).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.clientDocuments).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.checklistTemplates).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.projectChecklists).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.checklistResponses).select('*').order('atualizado_em', { ascending: false }),
      supabase.from(TABLES.stageTemplates).select('*').order('criado_em', { ascending: false }),
      supabase.from(TABLES.settings).select('*').limit(1).maybeSingle(),
    ]);

  if (
    partnersRes.error ||
    leadsRes.error ||
    projectsRes.error ||
    historyRes.error ||
    branchesRes.error ||
    tasksRes.error ||
    financeRes.error ||
    documentsRes.error ||
    clientsRes.error ||
    clientStagesRes.error ||
    clientUpdatesRes.error ||
    clientMessagesRes.error ||
    clientDocumentsRes.error ||
    checklistTemplatesRes.error ||
    projectChecklistsRes.error ||
    checklistResponsesRes.error ||
    stageTemplatesRes.error ||
    settingsRes.error
  ) {
    throwOfficialDatabaseError(
      partnersRes.error ||
        leadsRes.error ||
        projectsRes.error ||
        historyRes.error ||
        branchesRes.error ||
        tasksRes.error ||
        financeRes.error ||
        documentsRes.error ||
        clientsRes.error ||
        clientStagesRes.error ||
        clientUpdatesRes.error ||
        clientMessagesRes.error ||
        clientDocumentsRes.error ||
        checklistTemplatesRes.error ||
        projectChecklistsRes.error ||
        checklistResponsesRes.error ||
        stageTemplatesRes.error ||
        settingsRes.error,
      'Nao foi possivel carregar o workspace oficial.',
    );
  }

  return {
    partners: (partnersRes.data || []).map((row) => mapPartner(row)),
    leads: (leadsRes.data || []).map((row) => mapLead(row)),
    projects: (projectsRes.data || []).map((row) => mapProject(row)),
    statusHistory: (historyRes.data || []).map((row) => mapStatusHistory(row)),
    branches: (branchesRes.data || []).map((row) => mapBranch(row)),
    tasks: (tasksRes.data || []).map((row) => mapTask(row)),
    finance: orderByDateDesc((financeRes.data || []).map((row) => mapFinance(row))),
    documents: await Promise.all((documentsRes.data || []).map((row) => mapDocumentAsync(row))),
    clients: (clientsRes.data || []).map((row) => mapClient(row)),
    clientStages: (clientStagesRes.data || []).map((row) => mapClientStage(row)),
    clientUpdates: orderByDateDesc((clientUpdatesRes.data || []).map((row) => mapClientUpdate(row))),
    clientMessages: orderByDateDesc((clientMessagesRes.data || []).map((row) => mapClientMessage(row))),
    clientDocuments: await Promise.all((clientDocumentsRes.data || []).map((row) => mapClientDocumentAsync(row))),
    checklistTemplates: (checklistTemplatesRes.data || []).map((row) => mapChecklistTemplate(row)),
    projectChecklists: (projectChecklistsRes.data || []).map((row) => mapProjectChecklist(row)),
    checklistResponses: orderByDateDesc((checklistResponsesRes.data || []).map((row) => mapChecklistResponse(row))),
    stageTemplates: (stageTemplatesRes.data || []).map((row) => mapStageTemplate(row)),
    settings: mapSettings(settingsRes.data),
  };
};

export const verifyOfficialPartner = async (username: string, password: string) => {
  const supabase = assertOfficialMode();
  const { data: existingPartners, error: existingPartnersError } = await supabase
    .from(TABLES.partners)
    .select('username')
    .in(
      'username',
      defaultOfficialPartners.map((partner) => partner.username),
    );

  if (existingPartnersError) {
    throwOfficialDatabaseError(existingPartnersError, 'Nao foi possivel verificar os socios oficiais.');
  }

  const existingUsernames = new Set((existingPartners || []).map((partner) => String(partner.username)));
  const missingPartners = defaultOfficialPartners.filter((partner) => !existingUsernames.has(partner.username));

  if (missingPartners.length) {
    const { error: seedError } = await supabase.from(TABLES.partners).insert(missingPartners);

    if (seedError) {
      throwOfficialDatabaseError(seedError, 'Nao foi possivel preparar os socios padrao no Supabase.');
    }
  }

  const { data, error } = await supabase
    .from(TABLES.partners)
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle();

  if (error) {
    throwOfficialDatabaseError(error, 'Nao foi possivel consultar os socios oficiais.');
  }

  if (!data) {
    return null;
  }

  const partner = mapPartner(data);
  const currentHash = hashPassword(username, password);
  const passwordMatches = getPasswordHashCandidates(username, password).includes(partner.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  if (partner.passwordHash !== currentHash) {
    const { error: updatePasswordError } = await supabase
      .from(TABLES.partners)
      .update({ password_hash: currentHash })
      .eq('username', username.toLowerCase());

    if (updatePasswordError) {
      throwOfficialDatabaseError(updatePasswordError, 'Nao foi possivel atualizar a senha do socio oficial.');
    }

    partner.passwordHash = currentHash;
  }

  return partner;
};

export const saveWorkspaceSettingsOfficial = async (settings: WorkspaceSettings) => {
  const supabase = assertOfficialMode();
  const { error } = await supabase.from(TABLES.settings).upsert(
    {
      id: 'workspace-settings',
      resend_enabled: settings.resendEnabled,
      resend_from_email: settings.resendFromEmail,
    },
    { onConflict: 'id' },
  );

  if (error) {
    throw new Error(error.message);
  }
};

export const updateOfficialPartnerPreferences = async (
  username: string,
  patch: Partial<Pick<Partner, 'notificationsEmail' | 'notificationsBrowser' | 'themePreference'>>,
) => {
  const supabase = assertOfficialMode();
  const { error } = await supabase
    .from(TABLES.partners)
    .update({
      notifications_email: patch.notificationsEmail,
      notifications_browser: patch.notificationsBrowser,
      theme_preference: patch.themePreference,
    })
    .eq('username', username);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateOfficialPartnerPassword = async (username: string, password: string) => {
  const supabase = assertOfficialMode();
  const { error } = await supabase
    .from(TABLES.partners)
    .update({ password_hash: hashPassword(username, password) })
    .eq('username', username);

  if (error) {
    throw new Error(error.message);
  }
};

export const uploadOfficialDocumentFile = async (projectId: string, file: File) => {
  const supabase = assertOfficialMode();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = sanitizeFileName(file.name || 'documento');
  const filePath = `${projectId}/${timestamp}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(publicEnv.projectDocumentsBucket).upload(filePath, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    filePath,
    fileUrl: await createSignedDocumentUrl(filePath),
  };
};

const generateTemporaryPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  return Array.from({ length: 12 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

export const uploadOfficialClientDocumentFile = async (projectId: string, file: File) => {
  const supabase = assertOfficialMode();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = sanitizeFileName(file.name || 'documento-cliente');
  const filePath = `client-portal/${projectId}/${timestamp}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(publicEnv.projectDocumentsBucket).upload(filePath, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    filePath,
    fileUrl: await createSignedClientDocumentUrl(filePath),
  };
};

export const uploadOfficialChecklistFile = async (projectId: string, file: File) => {
  const supabase = assertOfficialMode();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = sanitizeFileName(file.name || 'checklist-arquivo');
  const filePath = `client-checklists/${projectId}/${timestamp}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(publicEnv.projectDocumentsBucket).upload(filePath, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    filePath,
    fileUrl: await createSignedClientDocumentUrl(filePath),
  };
};

export const getClientPortalSnapshotByUserId = async (userId: string): Promise<ClientPortalSnapshot | null> => {
  const supabase = assertOfficialMode();
  const { data: clientRow, error: clientError } = await supabase
    .from(TABLES.clients)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (clientError) {
    throw new Error(clientError.message);
  }

  if (!clientRow) {
    return null;
  }

  const client = mapClient(clientRow as Record<string, unknown>);

  const [
    projectRes,
    partnersRes,
    stagesRes,
    updatesRes,
    messagesRes,
    documentsRes,
    checklistRes,
  ] = await Promise.all([
    supabase.from(TABLES.projects).select('*').eq('id', client.projectId).maybeSingle(),
    supabase.from(TABLES.partners).select('*').order('display_name', { ascending: true }),
    supabase.from(TABLES.clientStages).select('*').eq('projeto_id', client.projectId).order('ordem', { ascending: true }),
    supabase.from(TABLES.clientUpdates).select('*').eq('projeto_id', client.projectId).order('criado_em', { ascending: false }).limit(50),
    supabase.from(TABLES.clientMessages).select('*').eq('projeto_id', client.projectId).order('criado_em', { ascending: false }).limit(100),
    supabase.from(TABLES.clientDocuments).select('*').eq('projeto_id', client.projectId).order('criado_em', { ascending: false }),
    supabase.from(TABLES.projectChecklists).select('*').eq('projeto_id', client.projectId).order('criado_em', { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (
    projectRes.error ||
    partnersRes.error ||
    stagesRes.error ||
    updatesRes.error ||
    messagesRes.error ||
    documentsRes.error ||
    checklistRes.error
  ) {
    throw new Error(
      projectRes.error?.message ||
        partnersRes.error?.message ||
        stagesRes.error?.message ||
        updatesRes.error?.message ||
        messagesRes.error?.message ||
        documentsRes.error?.message ||
        checklistRes.error?.message ||
        'Nao foi possivel carregar o portal do cliente.',
    );
  }

  if (!projectRes.data) {
    return null;
  }

  const project = mapProject(projectRes.data as Record<string, unknown>);
  const partners = (partnersRes.data || []).map((row) => mapPartner(row));
  const responsiblePartner = partners.find((partner) => project.partnerIds.includes(partner.id)) || null;
  const checklist = checklistRes.data ? mapProjectChecklist(checklistRes.data as Record<string, unknown>) : null;
  let checklistResponsesRows: Record<string, unknown>[] = [];

  if (checklist) {
    const responsesRes = await supabase
      .from(TABLES.checklistResponses)
      .select('*')
      .eq('checklist_id', checklist.id)
      .order('atualizado_em', { ascending: false });

    if (responsesRes.error) {
      throw new Error(responsesRes.error.message);
    }

    checklistResponsesRows = (responsesRes.data || []) as Record<string, unknown>[];
  }

  return {
    client,
    project,
    responsiblePartner,
    partners,
    stages: (stagesRes.data || []).map((row) => mapClientStage(row)),
    updates: orderByDateDesc((updatesRes.data || []).map((row) => mapClientUpdate(row))),
    messages: orderByDateDesc((messagesRes.data || []).map((row) => mapClientMessage(row))),
    documents: await Promise.all((documentsRes.data || []).map((row) => mapClientDocumentAsync(row))),
    checklist,
    checklistResponses: checklistResponsesRows.map((row) => mapChecklistResponse(row)),
  };
};

type WorkspaceActionPayload =
  | { type: 'lead-status'; leadId: string; status: Lead['status'] }
  | { type: 'lead-convert'; leadId: string; project: Omit<Project, 'id' | 'createdAt' | 'concludedAt' | 'testimonial' | 'useAsCase'> }
  | { type: 'project-create'; project: Omit<Project, 'id' | 'createdAt' | 'concludedAt' | 'testimonial' | 'useAsCase'> }
  | { type: 'project-update'; projectId: string; patch: Partial<Project> }
  | { type: 'branch-create'; branch: Omit<Branch, 'id'> }
  | { type: 'task-create'; task: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'task-update'; taskId: string; patch: Partial<Task> }
  | { type: 'finance-create'; entry: Omit<FinanceEntry, 'id'> }
  | { type: 'document-create'; document: Omit<ProjectDocument, 'id'> }
  | { type: 'project-testimonial'; projectId: string; testimonial: string; useAsCase: boolean }
  | { type: 'client-access-create'; projectId: string; name: string; email: string; password: string }
  | { type: 'client-access-regenerate-password'; clientId: string; password?: string }
  | { type: 'client-stage-create'; stage: Omit<ClientPortalStage, 'id' | 'completedAt' | 'createdAt'> }
  | { type: 'client-stage-update'; stageId: string; patch: Partial<ClientPortalStage> }
  | { type: 'client-stage-delete'; stageId: string }
  | { type: 'client-stage-reorder'; projectId: string; stageIds: string[] }
  | { type: 'client-stage-complete'; stageId: string; updateTitle: string; updateDescription?: string | null }
  | { type: 'client-update-create'; update: Omit<ClientPortalUpdate, 'id' | 'createdAt'> }
  | { type: 'client-message-create'; message: Omit<ClientPortalMessage, 'id' | 'createdAt'> }
  | { type: 'client-document-create'; document: Omit<ClientPortalDocument, 'id' | 'createdAt'> }
  | { type: 'project-checklist-upsert'; checklist: ProjectChecklist }
  | {
      type: 'checklist-responses-save';
      checklistId: string;
      responses: Array<{ itemId: string; value: ChecklistResponseValue }>;
      checklistPatch?: Partial<Pick<ProjectChecklist, 'status' | 'releasedAt' | 'submittedAt' | 'reopenedAt' | 'lastSavedAt'>>;
    }
  | { type: 'checklist-template-upsert'; template: ChecklistTemplate }
  | { type: 'client-stages-replace'; projectId: string; stages: Omit<ClientPortalStage, 'id' | 'createdAt' | 'completedAt'>[] }
  | { type: 'stage-template-upsert'; template: StageTemplate };

export const runOfficialWorkspaceAction = async (payload: WorkspaceActionPayload, actorId: PartnerId) => {
  const supabase = assertOfficialMode();

  if (payload.type === 'lead-status') {
    const { error } = await supabase.from(TABLES.leads).update({ status: payload.status }).eq('id', payload.leadId);
    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'project-create') {
    const projectId = createId('project');
    const createdAt = new Date().toISOString();
    const { error } = await supabase.from(TABLES.projects).insert({
      id: projectId,
      nome: payload.project.name,
      cliente_nome: payload.project.clientName,
      cliente_email: payload.project.clientEmail,
      empresa: payload.project.company,
      tipo: payload.project.type,
      descricao: payload.project.description,
      valor_total: payload.project.valueTotal,
      valor_recebido: payload.project.valueReceived,
      prazo: payload.project.dueDate,
      status: payload.project.status,
      socios_ids: payload.project.partnerIds,
      criado_em: createdAt,
      concluido_em: null,
      depoimento: null,
      usar_como_case: false,
    });
    if (error) throw new Error(error.message);
    await insertStatusHistory(projectId, payload.project.status, actorId, createdAt);
    return;
  }

  if (payload.type === 'lead-convert') {
    const projectId = createId('project');
    const createdAt = new Date().toISOString();
    const { error: projectError } = await supabase.from(TABLES.projects).insert({
      id: projectId,
      nome: payload.project.name,
      cliente_nome: payload.project.clientName,
      cliente_email: payload.project.clientEmail,
      empresa: payload.project.company,
      tipo: payload.project.type,
      descricao: payload.project.description,
      valor_total: payload.project.valueTotal,
      valor_recebido: payload.project.valueReceived,
      prazo: payload.project.dueDate,
      status: payload.project.status,
      socios_ids: payload.project.partnerIds,
      criado_em: createdAt,
      concluido_em: null,
      depoimento: null,
      usar_como_case: false,
    });

    if (projectError) throw new Error(projectError.message);
    await insertStatusHistory(projectId, payload.project.status, actorId, createdAt);

    const { error: leadError } = await supabase
      .from(TABLES.leads)
      .update({
        status: 'Convertido',
        convertido_em: new Date().toISOString(),
        projeto_id: projectId,
      })
      .eq('id', payload.leadId);

    if (leadError) throw new Error(leadError.message);
    return;
  }

  if (payload.type === 'project-update') {
    const patch: Record<string, unknown> = {};
    if (typeof payload.patch.name !== 'undefined') patch.nome = payload.patch.name;
    if (typeof payload.patch.clientName !== 'undefined') patch.cliente_nome = payload.patch.clientName;
    if (typeof payload.patch.clientEmail !== 'undefined') patch.cliente_email = payload.patch.clientEmail;
    if (typeof payload.patch.company !== 'undefined') patch.empresa = payload.patch.company;
    if (typeof payload.patch.type !== 'undefined') patch.tipo = payload.patch.type;
    if (typeof payload.patch.description !== 'undefined') patch.descricao = payload.patch.description;
    if (typeof payload.patch.valueTotal !== 'undefined') patch.valor_total = payload.patch.valueTotal;
    if (typeof payload.patch.valueReceived !== 'undefined') patch.valor_recebido = payload.patch.valueReceived;
    if (typeof payload.patch.dueDate !== 'undefined') patch.prazo = payload.patch.dueDate;
    if (typeof payload.patch.status !== 'undefined') patch.status = payload.patch.status;
    if (typeof payload.patch.partnerIds !== 'undefined') patch.socios_ids = payload.patch.partnerIds;
    if (typeof payload.patch.concludedAt !== 'undefined') patch.concluido_em = payload.patch.concludedAt;
    if (typeof payload.patch.useAsCase !== 'undefined') patch.usar_como_case = payload.patch.useAsCase;
    if (typeof payload.patch.testimonial !== 'undefined') patch.depoimento = payload.patch.testimonial;

    const { error } = await supabase.from(TABLES.projects).update(patch).eq('id', payload.projectId);
    if (error) throw new Error(error.message);
    if (payload.patch.status) {
      await insertStatusHistory(payload.projectId, payload.patch.status, actorId);
    }
    return;
  }

  if (payload.type === 'branch-create') {
    const { error } = await supabase.from(TABLES.branches).insert({
      id: createId('branch'),
      projeto_id: payload.branch.projectId,
      nome: payload.branch.name,
      ordem: payload.branch.order,
    });
    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'task-create') {
    const { error } = await supabase.from(TABLES.tasks).insert({
      id: createId('task'),
      projeto_id: payload.task.projectId,
      ramificacao_id: payload.task.branchId,
      titulo: payload.task.title,
      descricao: payload.task.description,
      responsavel_id: payload.task.assigneeId,
      prazo: payload.task.dueDate,
      prioridade: payload.task.priority,
      status: payload.task.status,
      criado_em: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'task-update') {
    const patch: Record<string, unknown> = {};
    if (typeof payload.patch.title !== 'undefined') patch.titulo = payload.patch.title;
    if (typeof payload.patch.description !== 'undefined') patch.descricao = payload.patch.description;
    if (typeof payload.patch.assigneeId !== 'undefined') patch.responsavel_id = payload.patch.assigneeId;
    if (typeof payload.patch.dueDate !== 'undefined') patch.prazo = payload.patch.dueDate;
    if (typeof payload.patch.priority !== 'undefined') patch.prioridade = payload.patch.priority;
    if (typeof payload.patch.status !== 'undefined') patch.status = payload.patch.status;
    if (typeof payload.patch.branchId !== 'undefined') patch.ramificacao_id = payload.patch.branchId;
    if (typeof payload.patch.projectId !== 'undefined') patch.projeto_id = payload.patch.projectId;

    const { error } = await supabase.from(TABLES.tasks).update(patch).eq('id', payload.taskId);
    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'finance-create') {
    const { error } = await supabase.from(TABLES.finance).insert({
      id: createId('finance'),
      projeto_id: payload.entry.projectId,
      descricao: payload.entry.description,
      valor: payload.entry.value,
      tipo: payload.entry.type,
      status: payload.entry.status,
      data: payload.entry.date,
    });
    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'document-create') {
    const { error } = await supabase.from(TABLES.documents).insert({
      id: createId('document'),
      projeto_id: payload.document.projectId,
      nome: payload.document.name,
      file_url: payload.document.fileUrl,
      file_path: payload.document.filePath,
      criado_em: payload.document.uploadedAt,
    });
    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'project-testimonial') {
    const { error } = await supabase
      .from(TABLES.projects)
      .update({ depoimento: payload.testimonial, usar_como_case: payload.useAsCase })
      .eq('id', payload.projectId);

    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'client-access-create') {
    const chosenPassword = payload.password.trim() || generateTemporaryPassword();
    const { data: existingClient, error: existingClientError } = await supabase
      .from(TABLES.clients)
      .select('id, user_id')
      .eq('projeto_id', payload.projectId)
      .maybeSingle();

    if (existingClientError) {
      throw new Error(existingClientError.message);
    }

    let authUserId: string;

    const existingClientRow = (existingClient || null) as ExistingClientRow | null;

    if (existingClientRow?.user_id) {
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(String(existingClientRow.user_id), {
        email: payload.email,
        password: chosenPassword,
        user_metadata: {
          full_name: payload.name,
          role: 'cliente',
        },
      });

      if (authUpdateError) {
        throw new Error(authUpdateError.message);
      }

      authUserId = String(existingClientRow.user_id);
    } else {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: payload.email,
        password: chosenPassword,
        email_confirm: true,
        user_metadata: {
          full_name: payload.name,
          role: 'cliente',
        },
      });

      if (authError || !authUser.user) {
        throw new Error(authError?.message || 'Nao foi possivel criar o acesso do cliente.');
      }

      authUserId = authUser.user.id;
    }

    if (existingClientRow?.id) {
      const { error } = await supabase
        .from(TABLES.clients)
        .update({
          user_id: authUserId,
          nome: payload.name,
          email: payload.email,
        })
        .eq('id', existingClientRow.id);

      if (error) throw new Error(error.message);

      return { temporaryPassword: chosenPassword, clientId: existingClientRow.id };
    }

    const clientId = createId('client');
    const { error } = await supabase.from(TABLES.clients).insert({
      id: clientId,
      user_id: authUserId,
      nome: payload.name,
      email: payload.email,
      projeto_id: payload.projectId,
      criado_em: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);

    return { temporaryPassword: chosenPassword, clientId };
  }

  if (payload.type === 'client-access-regenerate-password') {
    const { data: clientRow, error: clientError } = await supabase
      .from(TABLES.clients)
      .select('*')
      .eq('id', payload.clientId)
      .maybeSingle();

    if (clientError) throw new Error(clientError.message);
    const clientAccessRow = (clientRow || null) as ClientRow | null;
    if (!clientAccessRow?.user_id) throw new Error('Esse cliente ainda nao possui acesso criado.');

    const temporaryPassword = payload.password?.trim() || generateTemporaryPassword();
    const { error } = await supabase.auth.admin.updateUserById(String(clientAccessRow.user_id), {
      password: temporaryPassword,
    });

    if (error) throw new Error(error.message);

    return { temporaryPassword, clientId: payload.clientId };
  }

  if (payload.type === 'client-stage-create') {
    const { error } = await supabase.from(TABLES.clientStages).insert({
      id: createId('stage'),
      projeto_id: payload.stage.projectId,
      nome: payload.stage.name,
      descricao: payload.stage.description,
      data_prevista: payload.stage.dueDate,
      status: payload.stage.status,
      ordem: payload.stage.order,
      concluida_em: null,
      criado_em: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'client-stage-update') {
    const patch: Record<string, unknown> = {};
    if (typeof payload.patch.name !== 'undefined') patch.nome = payload.patch.name;
    if (typeof payload.patch.description !== 'undefined') patch.descricao = payload.patch.description;
    if (typeof payload.patch.dueDate !== 'undefined') patch.data_prevista = payload.patch.dueDate;
    if (typeof payload.patch.status !== 'undefined') patch.status = payload.patch.status;
    if (typeof payload.patch.order !== 'undefined') patch.ordem = payload.patch.order;
    if (typeof payload.patch.completedAt !== 'undefined') patch.concluida_em = payload.patch.completedAt;

    const { error } = await supabase.from(TABLES.clientStages).update(patch).eq('id', payload.stageId);
    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'client-stage-delete') {
    const { error } = await supabase.from(TABLES.clientStages).delete().eq('id', payload.stageId);
    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'client-stage-reorder') {
    await Promise.all(
      payload.stageIds.map((stageId, index) =>
        supabase.from(TABLES.clientStages).update({ ordem: index + 1 }).eq('id', stageId),
      ),
    );
    return;
  }

  if (payload.type === 'client-stage-complete') {
    const { data: stageRow, error: stageError } = await supabase
      .from(TABLES.clientStages)
      .select('*')
      .eq('id', payload.stageId)
      .maybeSingle();

    if (stageError) throw new Error(stageError.message);
    const stage = (stageRow || null) as StageRow | null;
    if (!stage) throw new Error('Etapa nao encontrada.');

    const completedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from(TABLES.clientStages)
      .update({ status: 'concluida', concluida_em: completedAt })
      .eq('id', payload.stageId);

    if (updateError) throw new Error(updateError.message);

    const { error: feedError } = await supabase.from(TABLES.clientUpdates).insert({
      id: createId('update'),
      projeto_id: String(stage.projeto_id),
      titulo: payload.updateTitle,
      descricao: payload.updateDescription || String(stage.descricao || ''),
      icone: 'check',
      criado_em: completedAt,
    });

    if (feedError) throw new Error(feedError.message);
    return;
  }

  if (payload.type === 'client-update-create') {
    const { error } = await supabase.from(TABLES.clientUpdates).insert({
      id: createId('update'),
      projeto_id: payload.update.projectId,
      titulo: payload.update.title,
      descricao: payload.update.description,
      icone: payload.update.icon,
      criado_em: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'client-message-create') {
    const { error } = await supabase.from(TABLES.clientMessages).insert({
      id: createId('message'),
      projeto_id: payload.message.projectId,
      remetente_tipo: payload.message.senderType,
      remetente_nome: payload.message.senderName,
      texto: payload.message.text,
      criado_em: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'client-document-create') {
    const { error } = await supabase.from(TABLES.clientDocuments).insert({
      id: createId('client-document'),
      projeto_id: payload.document.projectId,
      nome: payload.document.name,
      tipo: payload.document.kind,
      url: payload.document.url,
      file_path: payload.document.filePath,
      criado_em: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'project-checklist-upsert') {
    const { checklist } = payload;
    const { error } = await supabase.from(TABLES.projectChecklists).upsert(
      {
        id: checklist.id,
        projeto_id: checklist.projectId,
        template_id: checklist.templateId,
        estrutura: checklist.structure,
        status: checklist.status,
        liberado_em: checklist.releasedAt,
        enviado_em: checklist.submittedAt,
        criado_em: checklist.createdAt,
        reaberto_em: checklist.reopenedAt,
        ultimo_salvamento_em: checklist.lastSavedAt,
      },
      { onConflict: 'id' },
    );

    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'checklist-responses-save') {
    const now = new Date().toISOString();
    const rows = payload.responses.map((response) => ({
      id: createId('checklist-response'),
      checklist_id: payload.checklistId,
      item_id: response.itemId,
      valor: response.value,
      atualizado_em: now,
    }));

    if (rows.length > 0) {
      const { error: responsesError } = await supabase
        .from(TABLES.checklistResponses)
        .upsert(rows, { onConflict: 'checklist_id,item_id' });

      if (responsesError) throw new Error(responsesError.message);
    }

    const patch = payload.checklistPatch || {};
    const projectChecklistPatch: Record<string, unknown> = {
      ultimo_salvamento_em: patch.lastSavedAt || now,
    };

    if (typeof patch.status !== 'undefined') projectChecklistPatch.status = patch.status;
    if (typeof patch.releasedAt !== 'undefined') projectChecklistPatch.liberado_em = patch.releasedAt;
    if (typeof patch.submittedAt !== 'undefined') projectChecklistPatch.enviado_em = patch.submittedAt;
    if (typeof patch.reopenedAt !== 'undefined') projectChecklistPatch.reaberto_em = patch.reopenedAt;

    const { error: checklistError } = await supabase
      .from(TABLES.projectChecklists)
      .update(projectChecklistPatch)
      .eq('id', payload.checklistId);

    if (checklistError) throw new Error(checklistError.message);
    return;
  }

  if (payload.type === 'checklist-template-upsert') {
    const { template } = payload;
    const { error } = await supabase.from(TABLES.checklistTemplates).upsert(
      {
        id: template.id,
        nome: template.name,
        tipo_projeto: template.projectType,
        estrutura: template.structure,
        criado_por: template.createdBy,
        criado_em: template.createdAt,
        is_default: template.isDefault,
      },
      { onConflict: 'id' },
    );

    if (error) throw new Error(error.message);
    return;
  }

  if (payload.type === 'client-stages-replace') {
    const { error: deleteError } = await supabase.from(TABLES.clientStages).delete().eq('projeto_id', payload.projectId);
    if (deleteError) throw new Error(deleteError.message);

    if (payload.stages.length === 0) {
      return;
    }

    const { error: insertError } = await supabase.from(TABLES.clientStages).insert(
      payload.stages.map((stage) => ({
        id: createId('stage'),
        projeto_id: payload.projectId,
        nome: stage.name,
        descricao: stage.description,
        data_prevista: stage.dueDate,
        status: stage.status,
        ordem: stage.order,
        concluida_em: stage.status === 'concluida' ? new Date().toISOString() : null,
        criado_em: new Date().toISOString(),
      })),
    );

    if (insertError) throw new Error(insertError.message);
    return;
  }

  if (payload.type === 'stage-template-upsert') {
    const { template } = payload;
    const { error } = await supabase.from(TABLES.stageTemplates).upsert(
      {
        id: template.id,
        nome: template.name,
        tipo_projeto: template.projectType,
        etapas: template.steps,
        criado_por: template.createdBy,
        criado_em: template.createdAt,
        is_default: template.isDefault,
      },
      { onConflict: 'id' },
    );

    if (error) throw new Error(error.message);
    return;
  }
};
