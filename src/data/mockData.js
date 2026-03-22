import { cloneDeep } from '../lib/utils';

export const demoCredentials = {
  email: 'socios@vexcoding.com',
  password: 'demo1234',
};

export const portfolioProjects = [
  {
    id: 'portfolio-fintech-dashboard',
    slug: 'fintech-dashboard',
    title: 'Fintech Dashboard',
    category: 'Sistema sob medida',
    shortDescription:
      'Painel operacional para analise financeira, alertas e acompanhamento de metas.',
    fullDescription:
      'Projeto exemplo de uma plataforma financeira com dashboard em tempo real, funil de onboarding e automacoes de atendimento. O foco aqui e mostrar como a VexCoding entrega produto, interface e operacao em um fluxo so.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    linkLabel: 'Abrir pagina do projeto',
    stack: ['React', 'Supabase', 'Dashboard', 'Automacao'],
    metrics: ['Onboarding 42% mais rapido', '3 paineis integrados', 'Financeiro em tempo real'],
  },
  {
    id: 'portfolio-lumina-studio',
    slug: 'lumina-studio',
    title: 'Lumina Studio',
    category: 'Landing page',
    shortDescription:
      'Site de apresentacao com narrativa forte, CTA objetivo e base preparada para captacao.',
    fullDescription:
      'Landing page ficticia para um estudio criativo. Estrutura focada em conversao, velocidade e clareza da proposta comercial. Serve como exemplo perfeito para voce trocar depois por cases reais sem alterar a base do projeto.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    linkLabel: 'Abrir pagina do projeto',
    stack: ['React', 'Motion', 'SEO', 'Copy comercial'],
    metrics: ['Hero com foco em CTA', 'Sessao de prova social', 'Formulario conectado'],
  },
  {
    id: 'portfolio-urban-store',
    slug: 'urban-store',
    title: 'Urban Store',
    category: 'E-commerce',
    shortDescription:
      'Loja online exemplo com vitrine, checkout direcionado e organizacao de catalogo.',
    fullDescription:
      'Case demonstrativo para uma loja digital com pagina de produto, organizacao de categorias e fluxo enxuto de compra. O objetivo e provar experiencia, nao volume de texto.',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    linkLabel: 'Abrir pagina do projeto',
    stack: ['Vitrine digital', 'Conversao', 'UX de compra', 'Performance'],
    metrics: ['Checkout mais limpo', 'Cards de produto claros', 'Estrutura pronta para escalar'],
  },
  {
    id: 'portfolio-nexus-crm',
    slug: 'nexus-crm',
    title: 'Nexus CRM',
    category: 'SaaS',
    shortDescription:
      'CRM enxuto para pipeline comercial, follow-up e gestao de relacionamento.',
    fullDescription:
      'Exemplo de SaaS pensado para times comerciais que precisam centralizar oportunidades, tarefas e proxima acao. Esse case conversa diretamente com o tipo de sistema interno que voce quer vender.',
    image:
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    linkLabel: 'Abrir pagina do projeto',
    stack: ['CRM', 'Pipeline', 'Gestao comercial', 'Relatorios'],
    metrics: ['Pipeline organizado', 'Follow-up visivel', 'Base preparada para escalar'],
  },
];

export const serviceTypes = [
  'Site / Landing Page',
  'E-commerce',
  'Sistema sob medida / SaaS',
  'Design / UI UX',
  'Automacao interna',
  'Outro',
];

export const leadStatuses = ['Novo', 'Qualificado', 'Em proposta', 'Fechado', 'Arquivado'];

export const projectStatuses = ['Briefing', 'Planejamento', 'Em andamento', 'Em aprovacao', 'Concluido'];

export const branchStatuses = ['Planejada', 'Em andamento', 'Em revisao', 'Concluida'];

export const taskStatuses = ['Backlog', 'Em andamento', 'Bloqueada', 'Concluida'];

export const financeKinds = ['Receita', 'Despesa'];

export const teamRoles = [
  'Socio - Produto',
  'Socio - Tecnologia',
  'Socia - Operacoes',
  'Front-end',
  'Back-end',
  'Designer',
  'QA',
  'Gestor de projeto',
];

const seedMembers = [
  {
    id: 'member-rafael',
    full_name: 'Rafael Nogueira',
    email: 'rafael@vexcoding.com',
    role: 'Socio - Produto',
    specialty: 'Comercial, discovery e estrategia',
    is_partner: true,
    workload_capacity: 40,
  },
  {
    id: 'member-luiza',
    full_name: 'Luiza Martins',
    email: 'luiza@vexcoding.com',
    role: 'Socia - Operacoes',
    specialty: 'Processos, prazos e atendimento',
    is_partner: true,
    workload_capacity: 40,
  },
  {
    id: 'member-caio',
    full_name: 'Caio Ferreira',
    email: 'caio@vexcoding.com',
    role: 'Socio - Tecnologia',
    specialty: 'Arquitetura, backend e automacoes',
    is_partner: true,
    workload_capacity: 40,
  },
  {
    id: 'member-heloisa',
    full_name: 'Heloisa Prado',
    email: 'heloisa@vexcoding.com',
    role: 'Designer',
    specialty: 'UI, branding e prototipacao',
    is_partner: false,
    workload_capacity: 35,
  },
  {
    id: 'member-gabriel',
    full_name: 'Gabriel Rocha',
    email: 'gabriel@vexcoding.com',
    role: 'Front-end',
    specialty: 'React, performance e componentizacao',
    is_partner: false,
    workload_capacity: 40,
  },
  {
    id: 'member-julia',
    full_name: 'Julia Lima',
    email: 'julia@vexcoding.com',
    role: 'Back-end',
    specialty: 'Banco de dados, API e integracoes',
    is_partner: false,
    workload_capacity: 40,
  },
];

const seedLeads = [
  {
    id: 'lead-aurora',
    name: 'Matheus Carvalho',
    email: 'matheus@auroralab.com',
    project_type: 'Sistema sob medida / SaaS',
    company: 'Aurora Lab',
    message:
      'Quero um painel para acompanhar leads, contratos, tickets e financeiro em um lugar so.',
    status: 'Novo',
    created_at: '2026-03-18T14:20:00.000Z',
    source: 'Site VexCoding',
  },
  {
    id: 'lead-orbit',
    name: 'Fernanda Alves',
    email: 'fernanda@orbitpay.com',
    project_type: 'Sistema sob medida / SaaS',
    company: 'Orbit Pay',
    message:
      'Precisamos de um portal de clientes com onboarding, documentos e etapas de aprovacao.',
    status: 'Qualificado',
    created_at: '2026-03-17T10:10:00.000Z',
    source: 'Site VexCoding',
  },
  {
    id: 'lead-lumina',
    name: 'Bruna Farias',
    email: 'bruna@luminastudio.com',
    project_type: 'Site / Landing Page',
    company: 'Lumina Studio',
    message:
      'Queremos uma landing page premium para apresentar servicos, formulario de contato e portfolio.',
    status: 'Fechado',
    created_at: '2026-03-05T13:30:00.000Z',
    source: 'Site VexCoding',
    converted_project_id: 'project-lumina',
  },
  {
    id: 'lead-vectra',
    name: 'Diego Melo',
    email: 'diego@vectraurban.com',
    project_type: 'E-commerce',
    company: 'Vectra Urban',
    message:
      'Loja digital com catalogo, destaque de colecoes e fluxo simples de compra.',
    status: 'Em proposta',
    created_at: '2026-03-15T08:45:00.000Z',
    source: 'Instagram',
  },
];

const seedProjects = [
  {
    id: 'project-orbit',
    lead_id: 'lead-orbit',
    name: 'Portal Orbit Pay',
    slug: 'portal-orbit-pay',
    client_name: 'Fernanda Alves',
    client_email: 'fernanda@orbitpay.com',
    company: 'Orbit Pay',
    service_type: 'Sistema sob medida / SaaS',
    summary:
      'Portal de clientes com onboarding, trilha documental, contratos e dashboard de status.',
    status: 'Em andamento',
    priority: 'Alta',
    budget_total: 48000,
    due_date: '2026-04-22',
    owner_id: 'member-luiza',
    completion: 62,
    created_at: '2026-03-08T09:00:00.000Z',
    completed_at: null,
    client_notes: 'Cliente responde rapido por WhatsApp e prefere checkpoints semanais.',
  },
  {
    id: 'project-nexus',
    lead_id: null,
    name: 'Nexus CRM',
    slug: 'nexus-crm-interno',
    client_name: 'Operacao interna',
    client_email: 'interno@vexcoding.com',
    company: 'VexCoding',
    service_type: 'Automacao interna',
    summary:
      'CRM interno para controlar pipeline, oportunidades e follow-up comercial.',
    status: 'Planejamento',
    priority: 'Media',
    budget_total: 22000,
    due_date: '2026-04-30',
    owner_id: 'member-rafael',
    completion: 28,
    created_at: '2026-03-12T11:20:00.000Z',
    completed_at: null,
    client_notes: 'Projeto interno que serve de laboratorio para futuras vendas.',
  },
  {
    id: 'project-lumina',
    lead_id: 'lead-lumina',
    name: 'Site Lumina Studio',
    slug: 'site-lumina-studio',
    client_name: 'Bruna Farias',
    client_email: 'bruna@luminastudio.com',
    company: 'Lumina Studio',
    service_type: 'Site / Landing Page',
    summary:
      'Landing page comercial com portfolio, CTA forte e formulario conectado.',
    status: 'Concluido',
    priority: 'Alta',
    budget_total: 14000,
    due_date: '2026-03-10',
    owner_id: 'member-heloisa',
    completion: 100,
    created_at: '2026-02-18T10:00:00.000Z',
    completed_at: '2026-03-09T18:00:00.000Z',
    client_notes: 'Cliente pediu texto curto, visual premium e manutencao simples.',
  },
];

const seedBranches = [
  {
    id: 'branch-orbit-discovery',
    project_id: 'project-orbit',
    name: 'Briefing e arquitetura',
    owner_id: 'member-rafael',
    status: 'Concluida',
    due_date: '2026-03-15',
    summary: 'Mapa de jornadas, entidades, acessos e escopo fechado.',
  },
  {
    id: 'branch-orbit-portal',
    project_id: 'project-orbit',
    name: 'Portal do cliente',
    owner_id: 'member-gabriel',
    status: 'Em andamento',
    due_date: '2026-04-05',
    summary: 'Area autenticada com etapas, status e envio de documentos.',
  },
  {
    id: 'branch-orbit-admin',
    project_id: 'project-orbit',
    name: 'Painel administrativo',
    owner_id: 'member-julia',
    status: 'Em revisao',
    due_date: '2026-04-12',
    summary: 'Controle interno de aprovacao, checklist e timeline operacional.',
  },
  {
    id: 'branch-nexus-commercial',
    project_id: 'project-nexus',
    name: 'Pipeline comercial',
    owner_id: 'member-rafael',
    status: 'Em andamento',
    due_date: '2026-04-04',
    summary: 'Funil de leads, follow-up e previsao de receita.',
  },
  {
    id: 'branch-lumina-site',
    project_id: 'project-lumina',
    name: 'Landing page principal',
    owner_id: 'member-heloisa',
    status: 'Concluida',
    due_date: '2026-03-03',
    summary: 'Hero, servicos, portfolio e formulario integrados.',
  },
];

const seedTasks = [
  {
    id: 'task-orbit-ux',
    project_id: 'project-orbit',
    branch_id: 'branch-orbit-portal',
    assignee_id: 'member-heloisa',
    title: 'Finalizar wireframes do onboarding',
    status: 'Concluida',
    priority: 'Alta',
    estimated_hours: 10,
    due_date: '2026-03-20',
  },
  {
    id: 'task-orbit-react',
    project_id: 'project-orbit',
    branch_id: 'branch-orbit-portal',
    assignee_id: 'member-gabriel',
    title: 'Construir dashboard autenticado no front-end',
    status: 'Em andamento',
    priority: 'Alta',
    estimated_hours: 18,
    due_date: '2026-03-29',
  },
  {
    id: 'task-orbit-db',
    project_id: 'project-orbit',
    branch_id: 'branch-orbit-admin',
    assignee_id: 'member-julia',
    title: 'Modelar tabelas e regras de aprovacao',
    status: 'Em andamento',
    priority: 'Alta',
    estimated_hours: 14,
    due_date: '2026-03-27',
  },
  {
    id: 'task-nexus-board',
    project_id: 'project-nexus',
    branch_id: 'branch-nexus-commercial',
    assignee_id: 'member-rafael',
    title: 'Definir etapas do funil e campos obrigatorios',
    status: 'Backlog',
    priority: 'Media',
    estimated_hours: 6,
    due_date: '2026-03-26',
  },
  {
    id: 'task-nexus-api',
    project_id: 'project-nexus',
    branch_id: 'branch-nexus-commercial',
    assignee_id: 'member-caio',
    title: 'Planejar API de oportunidades e notas',
    status: 'Em andamento',
    priority: 'Media',
    estimated_hours: 12,
    due_date: '2026-03-31',
  },
  {
    id: 'task-lumina-seo',
    project_id: 'project-lumina',
    branch_id: 'branch-lumina-site',
    assignee_id: 'member-gabriel',
    title: 'Ajustes finais de SEO e velocidade',
    status: 'Concluida',
    priority: 'Alta',
    estimated_hours: 5,
    due_date: '2026-03-08',
  },
];

const seedFinanceEntries = [
  {
    id: 'finance-lumina-income',
    project_id: 'project-lumina',
    kind: 'Receita',
    title: 'Pagamento final do projeto Lumina',
    amount: 14000,
    category: 'Landing page',
    entry_date: '2026-03-09',
    notes: 'Projeto entregue e aprovado.',
  },
  {
    id: 'finance-orbit-signal',
    project_id: 'project-orbit',
    kind: 'Receita',
    title: 'Sinal de inicio Orbit Pay',
    amount: 24000,
    category: 'Sistema sob medida',
    entry_date: '2026-03-10',
    notes: 'Primeira parcela recebida.',
  },
  {
    id: 'finance-orbit-server',
    project_id: 'project-orbit',
    kind: 'Despesa',
    title: 'Infra e ferramentas Orbit Pay',
    amount: 2800,
    category: 'Infraestrutura',
    entry_date: '2026-03-12',
    notes: 'Ferramentas de design, hospedagem e automacao.',
  },
  {
    id: 'finance-nexus-research',
    project_id: 'project-nexus',
    kind: 'Despesa',
    title: 'Pesquisa e benchmark Nexus CRM',
    amount: 900,
    category: 'Pesquisa',
    entry_date: '2026-03-13',
    notes: 'Horas internas de discovery.',
  },
];

const seedDocuments = [
  {
    id: 'document-lumina-briefing',
    project_id: 'project-lumina',
    title: 'Briefing aprovado',
    type: 'PDF',
    file_url: 'https://example.com/documentos/briefing-lumina.pdf',
    file_path: null,
    uploaded_at: '2026-02-19T10:00:00.000Z',
  },
  {
    id: 'document-lumina-proposta',
    project_id: 'project-lumina',
    title: 'Proposta comercial assinada',
    type: 'PDF',
    file_url: 'https://example.com/documentos/proposta-lumina.pdf',
    file_path: null,
    uploaded_at: '2026-02-20T15:30:00.000Z',
  },
];

export const demoDatabase = {
  members: seedMembers,
  leads: seedLeads,
  projects: seedProjects,
  branches: seedBranches,
  tasks: seedTasks,
  finance_entries: seedFinanceEntries,
  documents: seedDocuments,
};

export const createDemoDatabase = () => cloneDeep(demoDatabase);
