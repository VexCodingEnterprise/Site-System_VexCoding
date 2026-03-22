import { portfolioProjects } from '../data/mockData';
import {
  clearDemoSession,
  getDemoDatabase,
  getDemoSession,
  resetDemoDatabase,
  saveDemoDatabase,
  saveDemoSession,
  validateDemoCredentials,
} from './demoStore';
import { documentsBucket, hasSupabaseConfig, supabase } from './supabase';
import { cloneDeep, createId, getTodayIso, slugify } from './utils';

const TABLES = {
  leads: 'contact_requests',
  members: 'team_members',
  projects: 'projects',
  branches: 'project_branches',
  tasks: 'project_tasks',
  finance: 'finance_entries',
  documents: 'project_documents',
};

const buildErrorMessage = (error, fallback) => {
  if (!error) {
    return fallback;
  }

  const rawMessage = error.message || error.details || fallback;

  if (
    rawMessage.includes('relation') ||
    rawMessage.includes('does not exist') ||
    rawMessage.includes('schema cache')
  ) {
    return 'As tabelas do Supabase ainda nao existem. Rode o arquivo supabase/schema.sql no SQL Editor do projeto.';
  }

  if (rawMessage.includes('Invalid login credentials')) {
    return 'Login invalido. Confirme o email e a senha cadastrados no Supabase Auth.';
  }

  if (rawMessage.includes('Bucket not found')) {
    return 'O bucket de documentos ainda nao existe. Crie o bucket project-documents no Supabase Storage.';
  }

  return rawMessage;
};

const throwIfError = (error, fallback) => {
  if (error) {
    throw new Error(buildErrorMessage(error, fallback));
  }
};

const sortByNewest = (items, key) =>
  [...items].sort((first, second) => new Date(second[key] || 0) - new Date(first[key] || 0));

const sortByDueDate = (items, key) =>
  [...items].sort((first, second) => new Date(first[key] || '2999-12-31') - new Date(second[key] || '2999-12-31'));

const resolveDocumentUrls = async (documents) => {
  if (!supabase) {
    return documents;
  }

  return Promise.all(
    documents.map(async (document) => {
      if (!document.file_path) {
        return document;
      }

      const { data, error } = await supabase.storage
        .from(documentsBucket)
        .createSignedUrl(document.file_path, 60 * 60 * 12);

      if (error) {
        return document;
      }

      return {
        ...document,
        file_url: data?.signedUrl || document.file_url,
      };
    }),
  );
};

const createDemoSessionPayload = (email) => ({
  access_token: 'demo-session',
  refresh_token: 'demo-refresh',
  user: {
    id: 'demo-user',
    email,
    user_metadata: {
      full_name: 'Socios VexCoding',
    },
  },
  isDemo: true,
});

const createProjectPayload = (project) => ({
  lead_id: project.lead_id ?? null,
  name: project.name,
  slug: slugify(project.slug || project.name),
  client_name: project.client_name,
  client_email: project.client_email,
  company: project.company || null,
  service_type: project.service_type,
  summary: project.summary,
  status: project.status || 'Briefing',
  priority: project.priority || 'Media',
  budget_total: Number(project.budget_total || 0),
  due_date: project.due_date || null,
  owner_id: project.owner_id || null,
  completion: Number(project.completion || 0),
  client_notes: project.client_notes || null,
  completed_at: project.completed_at || null,
});

export const authApi = {
  isDemoMode: !hasSupabaseConfig,
  async getSession() {
    if (!supabase) {
      return getDemoSession();
    }

    const { data, error } = await supabase.auth.getSession();
    throwIfError(error, 'Nao foi possivel recuperar a sessao atual.');
    return data.session;
  },
  async signIn({ email, password }) {
    if (!supabase) {
      const normalizedEmail = email.trim().toLowerCase();
      if (!validateDemoCredentials(normalizedEmail, password)) {
        throw new Error('Use o login demo padrao ou configure o Supabase para autenticar socios reais.');
      }

      const session = createDemoSessionPayload(normalizedEmail);
      saveDemoSession(session);
      return session;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    throwIfError(error, 'Nao foi possivel entrar na area dos socios.');
    return data.session;
  },
  async signOut() {
    if (!supabase) {
      clearDemoSession();
      return;
    }

    const { error } = await supabase.auth.signOut();
    throwIfError(error, 'Nao foi possivel encerrar a sessao.');
  },
  onAuthStateChange(callback) {
    if (!supabase) {
      return {
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      };
    }

    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};

export const publicApi = {
  getPortfolioProjects() {
    return cloneDeep(portfolioProjects);
  },
  async submitLead(payload) {
    const normalized = {
      name: payload.name,
      email: payload.email,
      company: payload.company || null,
      project_type: payload.project_type,
      message: payload.message,
      status: 'Novo',
      source: 'Site VexCoding',
    };

    if (!supabase) {
      const database = getDemoDatabase();
      const newLead = {
        id: createId('lead'),
        ...normalized,
        created_at: getTodayIso(),
      };

      database.leads.unshift(newLead);
      saveDemoDatabase(database);
      return newLead;
    }

    const { data, error } = await supabase
      .from(TABLES.leads)
      .insert(normalized)
      .select('*')
      .single();

    throwIfError(error, 'Nao foi possivel enviar o contato para o Supabase.');
    return data;
  },
};

export const workspaceApi = {
  async getWorkspace() {
    if (!supabase) {
      const database = getDemoDatabase();
      return {
        leads: sortByNewest(database.leads, 'created_at'),
        members: cloneDeep(database.members),
        projects: sortByDueDate(database.projects, 'due_date'),
        branches: sortByDueDate(database.branches, 'due_date'),
        tasks: sortByDueDate(database.tasks, 'due_date'),
        finance_entries: sortByNewest(database.finance_entries, 'entry_date'),
        documents: sortByNewest(database.documents, 'uploaded_at'),
      };
    }

    const [leadsRes, membersRes, projectsRes, branchesRes, tasksRes, financeRes, documentsRes] =
      await Promise.all([
        supabase.from(TABLES.leads).select('*').order('created_at', { ascending: false }),
        supabase.from(TABLES.members).select('*').order('full_name', { ascending: true }),
        supabase.from(TABLES.projects).select('*').order('due_date', { ascending: true }),
        supabase.from(TABLES.branches).select('*').order('due_date', { ascending: true }),
        supabase.from(TABLES.tasks).select('*').order('due_date', { ascending: true }),
        supabase.from(TABLES.finance).select('*').order('entry_date', { ascending: false }),
        supabase.from(TABLES.documents).select('*').order('uploaded_at', { ascending: false }),
      ]);

    throwIfError(leadsRes.error, 'Nao foi possivel carregar os contatos.');
    throwIfError(membersRes.error, 'Nao foi possivel carregar a equipe.');
    throwIfError(projectsRes.error, 'Nao foi possivel carregar os projetos.');
    throwIfError(branchesRes.error, 'Nao foi possivel carregar as ramificacoes.');
    throwIfError(tasksRes.error, 'Nao foi possivel carregar as tarefas.');
    throwIfError(financeRes.error, 'Nao foi possivel carregar o financeiro.');
    throwIfError(documentsRes.error, 'Nao foi possivel carregar os documentos.');

    return {
      leads: leadsRes.data ?? [],
      members: membersRes.data ?? [],
      projects: projectsRes.data ?? [],
      branches: branchesRes.data ?? [],
      tasks: tasksRes.data ?? [],
      finance_entries: financeRes.data ?? [],
      documents: await resolveDocumentUrls(documentsRes.data ?? []),
    };
  },
  async updateLeadStatus(leadId, status) {
    if (!supabase) {
      const database = getDemoDatabase();
      database.leads = database.leads.map((lead) =>
        lead.id === leadId ? { ...lead, status } : lead,
      );
      saveDemoDatabase(database);
      return;
    }

    const { error } = await supabase.from(TABLES.leads).update({ status }).eq('id', leadId);
    throwIfError(error, 'Nao foi possivel atualizar o status do lead.');
  },
  async createProject(project) {
    const payload = createProjectPayload(project);

    if (!supabase) {
      const database = getDemoDatabase();
      const newProject = {
        id: createId('project'),
        created_at: getTodayIso(),
        ...payload,
      };
      database.projects.unshift(newProject);
      saveDemoDatabase(database);
      return newProject;
    }

    const { data, error } = await supabase
      .from(TABLES.projects)
      .insert(payload)
      .select('*')
      .single();

    throwIfError(error, 'Nao foi possivel criar o projeto.');
    return data;
  },
  async convertLeadToProject(lead, overrides = {}) {
    const project = await this.createProject({
      lead_id: lead.id,
      name: overrides.name || lead.company || `Projeto ${lead.name}`,
      client_name: lead.name,
      client_email: lead.email,
      company: lead.company || lead.name,
      service_type: lead.project_type,
      summary: overrides.summary || lead.message,
      status: overrides.status || 'Briefing',
      priority: overrides.priority || 'Media',
      budget_total: overrides.budget_total || 0,
      due_date: overrides.due_date || null,
      owner_id: overrides.owner_id || null,
      completion: overrides.completion || 5,
      client_notes: lead.message,
    });

    if (!supabase) {
      const database = getDemoDatabase();
      database.leads = database.leads.map((item) =>
        item.id === lead.id
          ? { ...item, status: 'Fechado', converted_project_id: project.id }
          : item,
      );
      saveDemoDatabase(database);
      return project;
    }

    const { error } = await supabase
      .from(TABLES.leads)
      .update({ status: 'Fechado', converted_project_id: project.id })
      .eq('id', lead.id);

    throwIfError(error, 'O projeto foi criado, mas o lead nao foi vinculado corretamente.');
    return project;
  },
  async updateProject(projectId, patch) {
    const payload = {
      ...patch,
      budget_total:
        typeof patch.budget_total === 'undefined' ? undefined : Number(patch.budget_total || 0),
      completion:
        typeof patch.completion === 'undefined' ? undefined : Number(patch.completion || 0),
      completed_at:
        patch.status === 'Concluido'
          ? patch.completed_at || getTodayIso()
          : patch.status
            ? null
            : patch.completed_at,
    };

    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    if (!supabase) {
      const database = getDemoDatabase();
      database.projects = database.projects.map((project) =>
        project.id === projectId ? { ...project, ...payload } : project,
      );
      saveDemoDatabase(database);
      return;
    }

    const { error } = await supabase.from(TABLES.projects).update(payload).eq('id', projectId);
    throwIfError(error, 'Nao foi possivel salvar as alteracoes do projeto.');
  },
  async createBranch(branch) {
    const payload = {
      project_id: branch.project_id,
      name: branch.name,
      owner_id: branch.owner_id || null,
      status: branch.status || 'Planejada',
      due_date: branch.due_date || null,
      summary: branch.summary || null,
    };

    if (!supabase) {
      const database = getDemoDatabase();
      const newBranch = { id: createId('branch'), ...payload };
      database.branches.unshift(newBranch);
      saveDemoDatabase(database);
      return newBranch;
    }

    const { data, error } = await supabase
      .from(TABLES.branches)
      .insert(payload)
      .select('*')
      .single();

    throwIfError(error, 'Nao foi possivel criar a ramificacao do projeto.');
    return data;
  },
  async updateBranch(branchId, patch) {
    if (!supabase) {
      const database = getDemoDatabase();
      database.branches = database.branches.map((branch) =>
        branch.id === branchId ? { ...branch, ...patch } : branch,
      );
      saveDemoDatabase(database);
      return;
    }

    const { error } = await supabase.from(TABLES.branches).update(patch).eq('id', branchId);
    throwIfError(error, 'Nao foi possivel atualizar a ramificacao.');
  },
  async createTask(task) {
    const payload = {
      project_id: task.project_id,
      branch_id: task.branch_id || null,
      assignee_id: task.assignee_id || null,
      title: task.title,
      status: task.status || 'Backlog',
      priority: task.priority || 'Media',
      estimated_hours: Number(task.estimated_hours || 0),
      due_date: task.due_date || null,
    };

    if (!supabase) {
      const database = getDemoDatabase();
      const newTask = { id: createId('task'), ...payload };
      database.tasks.unshift(newTask);
      saveDemoDatabase(database);
      return newTask;
    }

    const { data, error } = await supabase
      .from(TABLES.tasks)
      .insert(payload)
      .select('*')
      .single();

    throwIfError(error, 'Nao foi possivel criar a tarefa.');
    return data;
  },
  async updateTask(taskId, patch) {
    if (!supabase) {
      const database = getDemoDatabase();
      database.tasks = database.tasks.map((task) => (task.id === taskId ? { ...task, ...patch } : task));
      saveDemoDatabase(database);
      return;
    }

    const { error } = await supabase.from(TABLES.tasks).update(patch).eq('id', taskId);
    throwIfError(error, 'Nao foi possivel atualizar a tarefa.');
  },
  async createFinanceEntry(entry) {
    const payload = {
      project_id: entry.project_id || null,
      kind: entry.kind,
      title: entry.title,
      amount: Number(entry.amount || 0),
      category: entry.category || null,
      entry_date: entry.entry_date || new Date().toISOString().slice(0, 10),
      notes: entry.notes || null,
    };

    if (!supabase) {
      const database = getDemoDatabase();
      const newEntry = { id: createId('finance'), ...payload };
      database.finance_entries.unshift(newEntry);
      saveDemoDatabase(database);
      return newEntry;
    }

    const { data, error } = await supabase
      .from(TABLES.finance)
      .insert(payload)
      .select('*')
      .single();

    throwIfError(error, 'Nao foi possivel registrar a entrada financeira.');
    return data;
  },
  async createTeamMember(member) {
    const payload = {
      full_name: member.full_name,
      email: member.email,
      role: member.role,
      specialty: member.specialty || null,
      is_partner: Boolean(member.is_partner),
      workload_capacity: Number(member.workload_capacity || 40),
    };

    if (!supabase) {
      const database = getDemoDatabase();
      const newMember = { id: createId('member'), ...payload };
      database.members.push(newMember);
      saveDemoDatabase(database);
      return newMember;
    }

    const { data, error } = await supabase
      .from(TABLES.members)
      .insert(payload)
      .select('*')
      .single();

    throwIfError(error, 'Nao foi possivel adicionar a pessoa na equipe.');
    return data;
  },
  async createDocument({ project_id, title, type, externalUrl, file }) {
    let file_path = null;
    let file_url = externalUrl || null;

    if (file && !supabase) {
      throw new Error('No modo demo, use um link de documento. Upload de arquivo depende do Supabase Storage.');
    }

    if (file && supabase) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      file_path = `${project_id}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from(documentsBucket)
        .upload(file_path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      throwIfError(uploadError, 'Nao foi possivel enviar o arquivo para o Storage.');

      const { data: signedData, error: signedError } = await supabase.storage
        .from(documentsBucket)
        .createSignedUrl(file_path, 60 * 60 * 12);

      if (!signedError) {
        file_url = signedData?.signedUrl || null;
      }
    }

    const payload = {
      project_id,
      title,
      type: type || 'Documento',
      file_path,
      file_url,
      uploaded_at: getTodayIso(),
    };

    if (!supabase) {
      const database = getDemoDatabase();
      const newDocument = { id: createId('document'), ...payload };
      database.documents.unshift(newDocument);
      saveDemoDatabase(database);
      return newDocument;
    }

    const { data, error } = await supabase
      .from(TABLES.documents)
      .insert(payload)
      .select('*')
      .single();

    throwIfError(error, 'Nao foi possivel registrar o documento do projeto.');

    if (data.file_path && !data.file_url) {
      const [resolved] = await resolveDocumentUrls([data]);
      return resolved;
    }

    return data;
  },
  async resetDemoData() {
    if (supabase) {
      throw new Error('Reset automatico so existe no modo demo.');
    }

    return resetDemoDatabase();
  },
};
