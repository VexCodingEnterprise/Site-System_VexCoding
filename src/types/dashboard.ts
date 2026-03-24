export type AppMode = 'demo' | 'official';

export type PartnerId = 'rafael' | 'lourenzo';

export type LeadStatus = 'Novo' | 'Qualificado' | 'Em proposta' | 'Fechado' | 'Convertido';

export type ProjectStatus = 'Briefing' | 'Execucao' | 'Em aprovacao' | 'Concluido' | 'Pausado';

export type TaskStatus = 'Backlog' | 'Em andamento' | 'Bloqueado' | 'Concluido';

export type TaskPriority = 'Alta' | 'Media' | 'Baixa';

export type FinanceType = 'Entrada' | 'Saldo' | 'Despesa';

export type FinanceStatus = 'Recebido' | 'Pendente';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ChecklistFieldType =
  | 'text'
  | 'textarea'
  | 'file'
  | 'image_gallery'
  | 'single_choice'
  | 'multi_choice'
  | 'link'
  | 'color'
  | 'boolean';
export type ChecklistStatus = 'rascunho' | 'liberado' | 'em_preenchimento' | 'completo';
export type ClientPortalStageStatus = 'pendente' | 'em_andamento' | 'concluida';
export type ClientPortalUpdateIcon = 'check' | 'progress' | 'message' | 'upload' | 'review';
export type ClientPortalDocumentKind = 'contrato' | 'briefing' | 'layout' | 'outros';
export type ClientPortalMessageSenderType = 'cliente' | 'socio';

export interface Partner {
  id: PartnerId;
  username: string;
  displayName: string;
  role: string;
  email: string;
  avatarColor: string;
  passwordHash: string;
  notificationsEmail: boolean;
  notificationsBrowser: boolean;
  themePreference: ThemePreference;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  projectType: string;
  message: string;
  status: LeadStatus;
  createdAt: string;
  convertedAt: string | null;
  projectId: string | null;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  company: string;
  type: string;
  description: string;
  valueTotal: number;
  valueReceived: number;
  dueDate: string;
  status: ProjectStatus;
  partnerIds: PartnerId[];
  createdAt: string;
  concludedAt: string | null;
  testimonial: string | null;
  useAsCase: boolean;
}

export interface ProjectStatusHistoryEntry {
  id: string;
  projectId: string;
  status: ProjectStatus;
  changedAt: string;
  changedBy: PartnerId;
}

export interface Branch {
  id: string;
  projectId: string;
  name: string;
  order: number;
}

export interface Task {
  id: string;
  projectId: string;
  branchId: string;
  title: string;
  description: string;
  assigneeId: PartnerId;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface FinanceEntry {
  id: string;
  projectId: string;
  description: string;
  value: number;
  type: FinanceType;
  status: FinanceStatus;
  date: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  fileUrl: string;
  filePath: string | null;
  uploadedAt: string;
}

export interface ChecklistOption {
  id: string;
  label: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  description: string | null;
  order: number;
  collapsed: boolean;
}

export interface ChecklistItem {
  id: string;
  sectionId: string;
  title: string;
  type: ChecklistFieldType;
  required: boolean;
  helpText: string | null;
  options: ChecklistOption[];
  order: number;
  maxFiles: number | null;
  acceptedFormats: string[];
}

export interface ChecklistStructure {
  sections: ChecklistSection[];
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  projectType: string;
  structure: ChecklistStructure;
  createdBy: string;
  createdAt: string;
  isDefault: boolean;
}

export interface ProjectChecklist {
  id: string;
  projectId: string;
  templateId: string | null;
  structure: ChecklistStructure;
  status: ChecklistStatus;
  releasedAt: string | null;
  submittedAt: string | null;
  createdAt: string;
  reopenedAt: string | null;
  lastSavedAt: string | null;
}

export interface ChecklistFileValue {
  name: string;
  url: string;
  filePath: string | null;
  mimeType: string | null;
  size: number | null;
}

export type ChecklistResponseValue =
  | string
  | string[]
  | boolean
  | ChecklistFileValue
  | ChecklistFileValue[]
  | null;

export interface ChecklistResponse {
  id: string;
  checklistId: string;
  itemId: string;
  value: ChecklistResponseValue;
  updatedAt: string;
}

export interface WorkspaceSettings {
  resendEnabled: boolean;
  resendFromEmail: string;
}

export interface ClientAccount {
  id: string;
  userId: string | null;
  projectId: string;
  name: string;
  email: string;
  portalPassword?: string | null;
  createdAt: string;
  accessStatus: 'Aguardando criacao' | 'Acesso criado';
}

export interface ClientPortalStage {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  dueDate: string;
  status: ClientPortalStageStatus;
  order: number;
  completedAt: string | null;
  createdAt: string;
}

export interface ClientPortalUpdate {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  icon: ClientPortalUpdateIcon;
  createdAt: string;
}

export interface ClientPortalMessage {
  id: string;
  projectId: string;
  senderType: ClientPortalMessageSenderType;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface ClientPortalDocument {
  id: string;
  projectId: string;
  name: string;
  kind: ClientPortalDocumentKind;
  url: string;
  filePath: string | null;
  createdAt: string;
}

export interface StageTemplateStep {
  id: string;
  name: string;
  daysFromStart: number;
  description: string | null;
  order: number;
}

export interface StageTemplate {
  id: string;
  name: string;
  projectType: string;
  steps: StageTemplateStep[];
  createdBy: string;
  createdAt: string;
  isDefault: boolean;
}

export interface WorkspaceData {
  partners: Partner[];
  leads: Lead[];
  projects: Project[];
  statusHistory: ProjectStatusHistoryEntry[];
  branches: Branch[];
  tasks: Task[];
  finance: FinanceEntry[];
  documents: ProjectDocument[];
  clients: ClientAccount[];
  clientStages: ClientPortalStage[];
  clientUpdates: ClientPortalUpdate[];
  clientMessages: ClientPortalMessage[];
  clientDocuments: ClientPortalDocument[];
  checklistTemplates: ChecklistTemplate[];
  projectChecklists: ProjectChecklist[];
  checklistResponses: ChecklistResponse[];
  stageTemplates: StageTemplate[];
  settings: WorkspaceSettings;
}

export interface DashboardSession {
  partnerId: PartnerId;
  username: string;
  displayName: string;
  role: string;
  avatarColor: string;
}

export interface PublicLeadPayload {
  name: string;
  email: string;
  projectType: string;
  message: string;
}

export interface ClientPortalSnapshot {
  client: ClientAccount;
  project: Project;
  responsiblePartner: Partner | null;
  partners: Partner[];
  stages: ClientPortalStage[];
  updates: ClientPortalUpdate[];
  messages: ClientPortalMessage[];
  documents: ClientPortalDocument[];
  checklist: ProjectChecklist | null;
  checklistResponses: ChecklistResponse[];
}
