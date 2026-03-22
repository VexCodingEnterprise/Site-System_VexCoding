import type {
  Branch,
  ChecklistResponse,
  ChecklistTemplate,
  ClientAccount,
  ClientPortalDocument,
  ClientPortalMessage,
  ClientPortalStage,
  ClientPortalUpdate,
  FinanceEntry,
  Partner,
  Project,
  ProjectChecklist,
  ProjectDocument,
  ProjectStatusHistoryEntry,
  StageTemplate,
  Task,
  WorkspaceData,
} from '@/types/dashboard';
import type { Lead, WorkspaceSettings } from '@/types/dashboard';
import {
  createChecklistFromTemplate,
  defaultChecklistTemplates,
  getChecklistTemplateForProjectType,
} from '@/lib/checklist';
import { defaultStageTemplates } from '@/lib/etapasGerador';
import { cloneDeep } from '@/lib/utils';

export const fixedPartners: Partner[] = [
  {
    id: 'rafael',
    username: 'rafael',
    displayName: 'Rafael Nogueira',
    role: 'Socio de produto',
    email: 'rafael@vexcoding.com',
    avatarColor: '#0A0A0A',
    passwordHash: '1bea026c0a726221de7d97e6778571e1e8fd2a4a79b6227b4d66ba157b251ac8',
    notificationsEmail: true,
    notificationsBrowser: true,
    themePreference: 'dark',
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'lourenzo',
    username: 'lourenzo',
    displayName: 'Lourenzo Martins',
    role: 'Socio de operacoes',
    email: 'lourenzo@vexcoding.com',
    avatarColor: '#444444',
    passwordHash: '61e50f0b100ebfba6f0ab8b3c84e39ff45bf5fce013f0eac3ec7e12dbc530dbc',
    notificationsEmail: true,
    notificationsBrowser: true,
    themePreference: 'light',
    createdAt: '2026-03-01T09:00:00.000Z',
  },
];

export const projectTypeOptions = [
  'Landing Page',
  'Site institucional',
  'Sistema interno',
  'SaaS',
  'E-commerce',
  'Automacao',
];

export const branchTemplates = ['Front-end', 'Back-end', 'Design', 'Testes'];

export const leadStatusOptions = ['Novo', 'Qualificado', 'Em proposta', 'Fechado', 'Convertido'] as const;
export const projectStatusOptions = ['Briefing', 'Execucao', 'Em aprovacao', 'Concluido', 'Pausado'] as const;
export const taskStatusOptions = ['Backlog', 'Em andamento', 'Bloqueado', 'Concluido'] as const;
export const taskPriorityOptions = ['Alta', 'Media', 'Baixa'] as const;
export const clientPortalStageStatusOptions = ['pendente', 'em_andamento', 'concluida'] as const;
export const clientPortalDocumentKindOptions = ['contrato', 'briefing', 'layout', 'outros'] as const;

const leads: Lead[] = [
  {
    id: 'lead-aurora',
    name: 'Matheus Carvalho',
    email: 'matheus@auroralab.com',
    projectType: 'Sistema interno',
    message: 'Preciso de um painel comercial e operacional com contratos, tickets, financeiro e perfis.',
    status: 'Novo',
    createdAt: '2026-03-18T14:20:00.000Z',
    convertedAt: null,
    projectId: null,
  },
  {
    id: 'lead-orbit',
    name: 'Fernanda Alves',
    email: 'fernanda@orbitpay.com',
    projectType: 'SaaS',
    message: 'Portal de clientes com onboarding, documentos, aprovacoes e status do projeto.',
    status: 'Qualificado',
    createdAt: '2026-03-17T10:10:00.000Z',
    convertedAt: null,
    projectId: null,
  },
  {
    id: 'lead-brava',
    name: 'Renata Lima',
    email: 'renata@bravastore.com',
    projectType: 'E-commerce',
    message: 'Quero uma loja premium com colecoes, pagamentos e area de pedidos.',
    status: 'Em proposta',
    createdAt: '2026-03-15T08:45:00.000Z',
    convertedAt: null,
    projectId: null,
  },
  {
    id: 'lead-lumina',
    name: 'Bruna Farias',
    email: 'bruna@luminastudio.com',
    projectType: 'Landing Page',
    message: 'Landing page premium com portfolio e narrativa bem limpa para captacao.',
    status: 'Convertido',
    createdAt: '2026-03-05T13:30:00.000Z',
    convertedAt: '2026-03-06T10:00:00.000Z',
    projectId: 'project-lumina',
  },
];

const projects: Project[] = [
  {
    id: 'project-orbit',
    name: 'Portal Orbit Pay',
    clientName: 'Fernanda Alves',
    clientEmail: 'fernanda@orbitpay.com',
    company: 'Orbit Pay',
    type: 'SaaS',
    description: 'Portal de clientes com onboarding, documentos, dashboard de progresso e checkpoints.',
    valueTotal: 48000,
    valueReceived: 24000,
    dueDate: '2026-04-22',
    status: 'Execucao',
    partnerIds: ['rafael', 'lourenzo'],
    createdAt: '2026-03-08T09:00:00.000Z',
    concludedAt: null,
    testimonial: null,
    useAsCase: false,
  },
  {
    id: 'project-nexus',
    name: 'Nexus CRM',
    clientName: 'Operacao interna',
    clientEmail: 'interno@vexcoding.com',
    company: 'VexCoding',
    type: 'Sistema interno',
    description: 'CRM interno da VexCoding para organizar leads, propostas e follow-up comercial.',
    valueTotal: 32000,
    valueReceived: 16000,
    dueDate: '2026-04-30',
    status: 'Briefing',
    partnerIds: ['rafael', 'lourenzo'],
    createdAt: '2026-03-12T11:20:00.000Z',
    concludedAt: null,
    testimonial: null,
    useAsCase: false,
  },
  {
    id: 'project-lumina',
    name: 'Site Lumina Studio',
    clientName: 'Bruna Farias',
    clientEmail: 'bruna@luminastudio.com',
    company: 'Lumina Studio',
    type: 'Landing Page',
    description: 'Landing page comercial minimalista com portfolio, CTA forte e formulario.',
    valueTotal: 14000,
    valueReceived: 14000,
    dueDate: '2026-03-10',
    status: 'Concluido',
    partnerIds: ['rafael', 'lourenzo'],
    createdAt: '2026-02-18T10:00:00.000Z',
    concludedAt: '2026-03-09T18:00:00.000Z',
    testimonial: 'O projeto ficou limpo, rapido e muito acima do que eu tinha imaginado.',
    useAsCase: true,
  },
];

const statusHistory: ProjectStatusHistoryEntry[] = [
  {
    id: 'history-orbit-1',
    projectId: 'project-orbit',
    status: 'Briefing',
    changedAt: '2026-03-08T09:00:00.000Z',
    changedBy: 'rafael',
  },
  {
    id: 'history-orbit-2',
    projectId: 'project-orbit',
    status: 'Execucao',
    changedAt: '2026-03-15T09:10:00.000Z',
    changedBy: 'lourenzo',
  },
  {
    id: 'history-nexus-1',
    projectId: 'project-nexus',
    status: 'Briefing',
    changedAt: '2026-03-12T11:20:00.000Z',
    changedBy: 'rafael',
  },
  {
    id: 'history-lumina-1',
    projectId: 'project-lumina',
    status: 'Concluido',
    changedAt: '2026-03-09T18:00:00.000Z',
    changedBy: 'lourenzo',
  },
];

const branches: Branch[] = [
  { id: 'branch-orbit-front', projectId: 'project-orbit', name: 'Front-end', order: 1 },
  { id: 'branch-orbit-back', projectId: 'project-orbit', name: 'Back-end', order: 2 },
  { id: 'branch-orbit-design', projectId: 'project-orbit', name: 'Design', order: 3 },
  { id: 'branch-nexus-back', projectId: 'project-nexus', name: 'Back-end', order: 1 },
  { id: 'branch-nexus-front', projectId: 'project-nexus', name: 'Front-end', order: 2 },
  { id: 'branch-lumina-front', projectId: 'project-lumina', name: 'Front-end', order: 1 },
];

const tasks: Task[] = [
  {
    id: 'task-orbit-wireframes',
    projectId: 'project-orbit',
    branchId: 'branch-orbit-design',
    title: 'Fechar wireframes do onboarding',
    description: 'Fluxo de onboarding, checklist e estados vazios.',
    assigneeId: 'lourenzo',
    dueDate: '2026-03-24',
    priority: 'Alta',
    status: 'Concluido',
    createdAt: '2026-03-09T10:00:00.000Z',
  },
  {
    id: 'task-orbit-dashboard',
    projectId: 'project-orbit',
    branchId: 'branch-orbit-front',
    title: 'Construir dashboard autenticado',
    description: 'Cards de resumo, timeline e area de documentos.',
    assigneeId: 'lourenzo',
    dueDate: '2026-03-29',
    priority: 'Alta',
    status: 'Em andamento',
    createdAt: '2026-03-13T10:00:00.000Z',
  },
  {
    id: 'task-orbit-schema',
    projectId: 'project-orbit',
    branchId: 'branch-orbit-back',
    title: 'Modelar entidades e aprovacoes',
    description: 'Definir entidades, perfis de acesso e transicoes.',
    assigneeId: 'rafael',
    dueDate: '2026-03-27',
    priority: 'Alta',
    status: 'Backlog',
    createdAt: '2026-03-14T10:00:00.000Z',
  },
  {
    id: 'task-nexus-pipeline',
    projectId: 'project-nexus',
    branchId: 'branch-nexus-back',
    title: 'Definir etapas do pipeline comercial',
    description: 'Etapas, tags, previsao de receita e campos obrigatorios.',
    assigneeId: 'rafael',
    dueDate: '2026-03-31',
    priority: 'Media',
    status: 'Em andamento',
    createdAt: '2026-03-15T10:00:00.000Z',
  },
  {
    id: 'task-nexus-ui',
    projectId: 'project-nexus',
    branchId: 'branch-nexus-front',
    title: 'Criar layout da area comercial',
    description: 'Tabela de oportunidades, drawer e filtros.',
    assigneeId: 'lourenzo',
    dueDate: '2026-04-02',
    priority: 'Media',
    status: 'Bloqueado',
    createdAt: '2026-03-17T10:00:00.000Z',
  },
  {
    id: 'task-lumina-speed',
    projectId: 'project-lumina',
    branchId: 'branch-lumina-front',
    title: 'Ajustes finais de velocidade e SEO',
    description: 'Meta tags, cache e refinamento de assets.',
    assigneeId: 'lourenzo',
    dueDate: '2026-03-08',
    priority: 'Alta',
    status: 'Concluido',
    createdAt: '2026-03-06T10:00:00.000Z',
  },
];

const finance: FinanceEntry[] = [
  {
    id: 'finance-lumina-entry',
    projectId: 'project-lumina',
    description: 'Pagamento final projeto Lumina',
    value: 14000,
    type: 'Saldo',
    status: 'Recebido',
    date: '2026-03-09',
  },
  {
    id: 'finance-orbit-entry',
    projectId: 'project-orbit',
    description: 'Entrada 50% projeto Orbit Pay',
    value: 24000,
    type: 'Entrada',
    status: 'Recebido',
    date: '2026-03-10',
  },
  {
    id: 'finance-orbit-balance',
    projectId: 'project-orbit',
    description: 'Saldo na entrega Orbit Pay',
    value: 24000,
    type: 'Saldo',
    status: 'Pendente',
    date: '2026-04-22',
  },
  {
    id: 'finance-nexus-entry',
    projectId: 'project-nexus',
    description: 'Entrada interna Nexus CRM',
    value: 16000,
    type: 'Entrada',
    status: 'Recebido',
    date: '2026-03-14',
  },
];

const documents: ProjectDocument[] = [
  {
    id: 'doc-lumina-briefing',
    projectId: 'project-lumina',
    name: 'Briefing aprovado.pdf',
    fileUrl: 'https://example.com/documentos/briefing-lumina.pdf',
    filePath: null,
    uploadedAt: '2026-02-19T10:00:00.000Z',
  },
  {
    id: 'doc-lumina-contrato',
    projectId: 'project-lumina',
    name: 'Contrato assinado.pdf',
    fileUrl: 'https://example.com/documentos/contrato-lumina.pdf',
    filePath: null,
    uploadedAt: '2026-02-20T15:30:00.000Z',
  },
];

const clients: ClientAccount[] = [
  {
    id: 'client-orbit',
    userId: null,
    projectId: 'project-orbit',
    name: 'Fernanda Alves',
    email: 'fernanda@orbitpay.com',
    createdAt: '2026-03-11T10:00:00.000Z',
    accessStatus: 'Acesso criado',
  },
  {
    id: 'client-lumina',
    userId: null,
    projectId: 'project-lumina',
    name: 'Bruna Farias',
    email: 'bruna@luminastudio.com',
    createdAt: '2026-02-20T10:00:00.000Z',
    accessStatus: 'Acesso criado',
  },
];

const clientStages: ClientPortalStage[] = [
  {
    id: 'stage-orbit-1',
    projectId: 'project-orbit',
    name: 'Contrato assinado',
    description: 'Contrato validado e aceite formalizado.',
    dueDate: '2026-03-09',
    status: 'concluida',
    order: 1,
    completedAt: '2026-03-09T14:00:00.000Z',
    createdAt: '2026-03-08T09:00:00.000Z',
  },
  {
    id: 'stage-orbit-2',
    projectId: 'project-orbit',
    name: 'Pagamento recebido',
    description: 'Entrada de 50% confirmada no financeiro.',
    dueDate: '2026-03-10',
    status: 'concluida',
    order: 2,
    completedAt: '2026-03-10T16:00:00.000Z',
    createdAt: '2026-03-08T09:05:00.000Z',
  },
  {
    id: 'stage-orbit-3',
    projectId: 'project-orbit',
    name: 'Briefing',
    description: 'Mapeamento de escopo, fluxos e prioridades.',
    dueDate: '2026-03-14',
    status: 'concluida',
    order: 3,
    completedAt: '2026-03-14T18:20:00.000Z',
    createdAt: '2026-03-08T09:10:00.000Z',
  },
  {
    id: 'stage-orbit-4',
    projectId: 'project-orbit',
    name: 'Layout no Figma',
    description: 'Direcao visual e validacao da experiencia principal.',
    dueDate: '2026-03-21',
    status: 'em_andamento',
    order: 4,
    completedAt: null,
    createdAt: '2026-03-12T08:00:00.000Z',
  },
  {
    id: 'stage-orbit-5',
    projectId: 'project-orbit',
    name: 'Desenvolvimento front-end',
    description: 'Implementacao da interface validada.',
    dueDate: '2026-03-30',
    status: 'pendente',
    order: 5,
    completedAt: null,
    createdAt: '2026-03-12T08:10:00.000Z',
  },
  {
    id: 'stage-orbit-6',
    projectId: 'project-orbit',
    name: 'Integracao e testes',
    description: 'Ajustes finais, testes de fluxo e homologacao.',
    dueDate: '2026-04-16',
    status: 'pendente',
    order: 6,
    completedAt: null,
    createdAt: '2026-03-12T08:20:00.000Z',
  },
  {
    id: 'stage-orbit-7',
    projectId: 'project-orbit',
    name: 'Deploy',
    description: 'Publicacao final e checklist de entrega.',
    dueDate: '2026-04-22',
    status: 'pendente',
    order: 7,
    completedAt: null,
    createdAt: '2026-03-12T08:30:00.000Z',
  },
];

const clientUpdates: ClientPortalUpdate[] = [
  {
    id: 'update-orbit-1',
    projectId: 'project-orbit',
    title: 'Briefing concluido',
    description: 'Consolidamos escopo, prioridades e fluxo principal com a equipe da Orbit Pay.',
    icon: 'check',
    createdAt: '2026-03-14T18:20:00.000Z',
  },
  {
    id: 'update-orbit-2',
    projectId: 'project-orbit',
    title: 'Layout em desenvolvimento',
    description: 'Estamos refinando a navegacao e a apresentacao dos blocos do portal.',
    icon: 'progress',
    createdAt: '2026-03-20T10:12:00.000Z',
  },
  {
    id: 'update-orbit-3',
    projectId: 'project-orbit',
    title: 'Ajuste solicitado pelo cliente',
    description: 'Recebemos observacoes sobre a ordem de exibicao dos cards iniciais.',
    icon: 'message',
    createdAt: '2026-03-20T15:42:00.000Z',
  },
];

const clientMessages: ClientPortalMessage[] = [
  {
    id: 'message-orbit-1',
    projectId: 'project-orbit',
    senderType: 'socio',
    senderName: 'Rafael Nogueira',
    text: 'Organizamos o escopo e agora estamos fechando a camada visual do portal.',
    createdAt: '2026-03-20T09:30:00.000Z',
  },
  {
    id: 'message-orbit-2',
    projectId: 'project-orbit',
    senderType: 'cliente',
    senderName: 'Fernanda Alves',
    text: 'Perfeito. Conseguem destacar mais a etapa de documentos obrigatorios no onboarding?',
    createdAt: '2026-03-20T11:15:00.000Z',
  },
  {
    id: 'message-orbit-3',
    projectId: 'project-orbit',
    senderType: 'socio',
    senderName: 'Lourenzo Martins',
    text: 'Sim. Ja estamos prevendo esse ajuste no proximo envio do layout.',
    createdAt: '2026-03-20T11:48:00.000Z',
  },
];

const clientDocuments: ClientPortalDocument[] = [
  {
    id: 'client-doc-orbit-1',
    projectId: 'project-orbit',
    name: 'Contrato Orbit Pay.pdf',
    kind: 'contrato',
    url: 'https://example.com/documentos/orbit-contrato.pdf',
    filePath: null,
    createdAt: '2026-03-09T14:10:00.000Z',
  },
  {
    id: 'client-doc-orbit-2',
    projectId: 'project-orbit',
    name: 'Briefing consolidado.pdf',
    kind: 'briefing',
    url: 'https://example.com/documentos/orbit-briefing.pdf',
    filePath: null,
    createdAt: '2026-03-14T18:25:00.000Z',
  },
  {
    id: 'client-doc-orbit-3',
    projectId: 'project-orbit',
    name: 'Layout inicial.pdf',
    kind: 'layout',
    url: 'https://example.com/documentos/orbit-layout.pdf',
    filePath: null,
    createdAt: '2026-03-20T10:20:00.000Z',
  },
];

const checklistTemplates: ChecklistTemplate[] = cloneDeep(defaultChecklistTemplates);

const orbitChecklist: ProjectChecklist = {
  ...createChecklistFromTemplate('project-orbit', getChecklistTemplateForProjectType('SaaS')),
  id: 'checklist-orbit',
  status: 'em_preenchimento',
  releasedAt: '2026-03-16T09:00:00.000Z',
  lastSavedAt: '2026-03-20T11:05:00.000Z',
};

const nexusChecklist: ProjectChecklist = {
  ...createChecklistFromTemplate('project-nexus', getChecklistTemplateForProjectType('Sistema interno')),
  id: 'checklist-nexus',
  status: 'rascunho',
};

const luminaChecklist: ProjectChecklist = {
  ...createChecklistFromTemplate('project-lumina', getChecklistTemplateForProjectType('Landing Page')),
  id: 'checklist-lumina',
  status: 'completo',
  releasedAt: '2026-02-21T09:00:00.000Z',
  submittedAt: '2026-02-24T18:40:00.000Z',
  lastSavedAt: '2026-02-24T18:40:00.000Z',
};

const findItemId = (checklist: ProjectChecklist, includesTitle: string) =>
  checklist.structure.items.find((item) => item.title.toLowerCase().includes(includesTitle.toLowerCase()))?.id || '';

const checklistResponses: ChecklistResponse[] = [
  {
    id: 'checklist-response-orbit-1',
    checklistId: orbitChecklist.id,
    itemId: findItemId(orbitChecklist, 'Descreva o sistema'),
    value: 'Portal com onboarding, documentos, dashboard e niveis de acesso para clientes e operacao.',
    updatedAt: '2026-03-18T10:00:00.000Z',
  },
  {
    id: 'checklist-response-orbit-2',
    checklistId: orbitChecklist.id,
    itemId: findItemId(orbitChecklist, 'Quem vai usar'),
    value: 'Clientes finais, operacao interna e time comercial.',
    updatedAt: '2026-03-18T10:04:00.000Z',
  },
  {
    id: 'checklist-response-orbit-3',
    checklistId: orbitChecklist.id,
    itemId: findItemId(orbitChecklist, 'Quantos usuarios'),
    value: '20-100',
    updatedAt: '2026-03-18T10:05:00.000Z',
  },
  {
    id: 'checklist-response-orbit-4',
    checklistId: orbitChecklist.id,
    itemId: findItemId(orbitChecklist, 'Precisa de app mobile'),
    value: true,
    updatedAt: '2026-03-18T10:06:00.000Z',
  },
  {
    id: 'checklist-response-orbit-5',
    checklistId: orbitChecklist.id,
    itemId: findItemId(orbitChecklist, 'Liste as funcionalidades'),
    value: 'Dashboard, upload de documentos, mensagens, aprovacoes e timeline de etapas.',
    updatedAt: '2026-03-18T10:07:00.000Z',
  },
  {
    id: 'checklist-response-orbit-6',
    checklistId: orbitChecklist.id,
    itemId: findItemId(orbitChecklist, 'O que e mais urgente'),
    value: 'Onboarding do cliente e centralizacao de documentos obrigatorios.',
    updatedAt: '2026-03-18T10:08:00.000Z',
  },
  {
    id: 'checklist-response-lumina-1',
    checklistId: luminaChecklist.id,
    itemId: findItemId(luminaChecklist, 'Nome da empresa'),
    value: 'Lumina Studio',
    updatedAt: '2026-02-22T09:00:00.000Z',
  },
  {
    id: 'checklist-response-lumina-2',
    checklistId: luminaChecklist.id,
    itemId: findItemId(luminaChecklist, 'Sobre a empresa'),
    value: 'Estudio criativo focado em branding, campanhas e conteudo premium.',
    updatedAt: '2026-02-22T09:10:00.000Z',
  },
  {
    id: 'checklist-response-lumina-3',
    checklistId: luminaChecklist.id,
    itemId: findItemId(luminaChecklist, 'Servicos ou produtos'),
    value: 'Branding, social media, campanhas e direcao criativa.',
    updatedAt: '2026-02-22T09:12:00.000Z',
  },
  {
    id: 'checklist-response-lumina-4',
    checklistId: luminaChecklist.id,
    itemId: findItemId(luminaChecklist, 'E-mail de contato'),
    value: 'contato@luminastudio.com',
    updatedAt: '2026-02-22T09:15:00.000Z',
  },
  {
    id: 'checklist-response-lumina-5',
    checklistId: luminaChecklist.id,
    itemId: findItemId(luminaChecklist, 'Telefone/WhatsApp'),
    value: '(11) 99999-0000',
    updatedAt: '2026-02-22T09:16:00.000Z',
  },
];

const stageTemplates: StageTemplate[] = cloneDeep(defaultStageTemplates);

const settings: WorkspaceSettings = {
  resendEnabled: false,
  resendFromEmail: 'contato@vexcoding.com',
};

export const demoWorkspace: WorkspaceData = {
  partners: fixedPartners,
  leads,
  projects,
  statusHistory,
  branches,
  tasks,
  finance,
  documents,
  clients,
  clientStages,
  clientUpdates,
  clientMessages,
  clientDocuments,
  checklistTemplates,
  projectChecklists: [orbitChecklist, nexusChecklist, luminaChecklist],
  checklistResponses,
  stageTemplates,
  settings,
};

export const createDemoWorkspace = () => cloneDeep(demoWorkspace);
