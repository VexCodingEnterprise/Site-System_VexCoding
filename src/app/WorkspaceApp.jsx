import { useEffect, useState } from 'react';
import {
  Banknote,
  BriefcaseBusiness,
  Clock3,
  Code2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  branchStatuses,
  leadStatuses,
  projectStatuses,
  taskStatuses,
  teamRoles,
} from '../data/mockData';
import { authApi, workspaceApi } from '../lib/dataService';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getInitials,
  groupBy,
  sumBy,
} from '../lib/utils';
import { Card, Field, StatusBadge, inputClassName } from './shared';
import {
  createBranchForm,
  createDocumentForm,
  createFinanceForm,
  createProjectDraftFromLead,
  createProjectForm,
  createTaskForm,
  createTeamForm,
} from './workspaceConfig';

export const WorkspaceApp = ({ session, onSessionChange, navigateTo }) => {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedCompletedProjectId, setSelectedCompletedProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState(createProjectForm());
  const [leadProjectForm, setLeadProjectForm] = useState(createProjectDraftFromLead());
  const [branchForm, setBranchForm] = useState(createBranchForm());
  const [taskForm, setTaskForm] = useState(createTaskForm());
  const [financeForm, setFinanceForm] = useState(createFinanceForm());
  const [teamForm, setTeamForm] = useState(createTeamForm());
  const [documentForm, setDocumentForm] = useState(createDocumentForm());

  const loadWorkspace = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await workspaceApi.getWorkspace();
      setWorkspace(data);
    } catch (loadError) {
      setError(loadError.message || 'Nao foi possivel carregar o workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    if (!workspace) {
      return;
    }

    if (!workspace.leads.find((lead) => lead.id === selectedLeadId)) {
      const firstLead = workspace.leads[0] || null;
      setSelectedLeadId(firstLead?.id || null);
      if (firstLead) {
        setLeadProjectForm(createProjectDraftFromLead(firstLead));
      }
    }

    if (!workspace.projects.find((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(workspace.projects[0]?.id || null);
    }

    const completed = workspace.projects.filter((project) => project.status === 'Concluido');
    if (!completed.find((project) => project.id === selectedCompletedProjectId)) {
      setSelectedCompletedProjectId(completed[0]?.id || null);
    }
  }, [workspace, selectedLeadId, selectedProjectId, selectedCompletedProjectId]);

  useEffect(() => {
    if (feedback) {
      const timeout = window.setTimeout(() => setFeedback(''), 3600);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [feedback]);

  const runAction = async (label, action, successMessage) => {
    setBusyAction(label);
    setError('');

    try {
      await action();
      await loadWorkspace();
      if (successMessage) {
        setFeedback(successMessage);
      }
    } catch (actionError) {
      setError(actionError.message || 'Nao foi possivel concluir a acao.');
    } finally {
      setBusyAction('');
    }
  };

  const selectedLead = workspace?.leads.find((lead) => lead.id === selectedLeadId) || null;
  const selectedProject = workspace?.projects.find((project) => project.id === selectedProjectId) || null;
  const completedProjects = workspace?.projects.filter((project) => project.status === 'Concluido') || [];
  const selectedCompletedProject =
    completedProjects.find((project) => project.id === selectedCompletedProjectId) || null;
  const selectedProjectBranches = workspace?.branches.filter((branch) => branch.project_id === selectedProjectId) || [];
  const selectedProjectTasks = workspace?.tasks.filter((task) => task.project_id === selectedProjectId) || [];
  const selectedProjectDocuments =
    workspace?.documents.filter((document) => document.project_id === selectedCompletedProjectId) || [];
  const members = workspace?.members || [];
  const partnerMembers = members.filter((member) => member.is_partner);
  const activeProjects = workspace?.projects.filter((project) => project.status !== 'Concluido') || [];
  const openTasks = workspace?.tasks.filter((task) => task.status !== 'Concluida') || [];
  const taskGroups = groupBy(workspace?.tasks || [], (task) => task.status);
  const totalRevenue = sumBy(
    workspace?.finance_entries.filter((entry) => entry.kind === 'Receita') || [],
    (entry) => entry.amount,
  );
  const totalExpenses = sumBy(
    workspace?.finance_entries.filter((entry) => entry.kind === 'Despesa') || [],
    (entry) => entry.amount,
  );
  const partnerSplit = partnerMembers.length ? (totalRevenue - totalExpenses) / partnerMembers.length : 0;

  const getMemberName = (memberId) =>
    members.find((member) => member.id === memberId)?.full_name || 'Nao atribuido';

  const tabs = [
    { id: 'overview', label: 'Visao geral', icon: <LayoutDashboard size={17} /> },
    { id: 'leads', label: 'Leads', icon: <MessageSquare size={17} /> },
    { id: 'projects', label: 'Projetos', icon: <FolderKanban size={17} /> },
    { id: 'execution', label: 'Execucao', icon: <BriefcaseBusiness size={17} /> },
    { id: 'finance', label: 'Financeiro', icon: <WalletCards size={17} /> },
    { id: 'completed', label: 'Concluidos', icon: <FileText size={17} /> },
    { id: 'team', label: 'Equipe', icon: <Users size={17} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <Card className="rounded-[36px] p-10 text-center">
            <p className="text-lg font-medium text-[#0A0A0A]">Carregando o workspace interno...</p>
            <p className="mt-2 text-sm text-gray-500">Buscando leads, projetos, tarefas, financeiro e documentos.</p>
          </Card>
        </div>
      </div>
    );
  }

  const overviewSection = (
    <div className="space-y-6">
      {authApi.isDemoMode ? (
        <Card className="rounded-[28px] border-amber-200 bg-amber-50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">Modo demo</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-amber-800">
                O site inteiro ja esta funcional usando armazenamento local. Assim que voce preencher as variaveis do Supabase, o mesmo fluxo passa a gravar dados reais.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                runAction(
                  'reset-demo',
                  () => workspaceApi.resetDemoData(),
                  'Base demo restaurada com sucesso.',
                )
              }
              className="rounded-xl border border-amber-300 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              {busyAction === 'reset-demo' ? 'Restaurando...' : 'Resetar dados demo'}
            </button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Leads novos',
            value: workspace?.leads.filter((lead) => lead.status === 'Novo').length || 0,
            helper: 'Contatos aguardando qualificacao',
            icon: <Sparkles size={18} />,
          },
          {
            label: 'Projetos ativos',
            value: activeProjects.length,
            helper: 'Em briefing, execucao ou aprovacao',
            icon: <FolderKanban size={18} />,
          },
          {
            label: 'Tarefas abertas',
            value: openTasks.length,
            helper: 'Backlog, andamento ou bloqueadas',
            icon: <Clock3 size={18} />,
          },
          {
            label: 'Lucro atual',
            value: formatCurrency(totalRevenue - totalExpenses),
            helper: `Divisao estimada por socio: ${formatCurrency(partnerSplit)}`,
            icon: <Banknote size={18} />,
          },
        ].map((item) => (
          <Card key={item.label} className="rounded-[28px]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F5F5] text-[#0A0A0A]">
                {item.icon}
              </div>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-[#0A0A0A]">{item.value}</p>
            <p className="mt-2 text-sm text-gray-500">{item.helper}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[28px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Entradas mais recentes</p>
              <p className="mt-1 text-sm text-gray-500">Leads vindos do formulario publico e de outros canais.</p>
            </div>
            <button type="button" onClick={() => setActiveTab('leads')} className="text-sm font-medium text-[#0A0A0A]">
              Ir para leads
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {workspace?.leads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="rounded-2xl border border-gray-100 px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-[#0A0A0A]">{lead.name}</p>
                    <p className="text-sm text-gray-500">
                      {lead.company || 'Sem empresa'} • {lead.project_type}
                    </p>
                  </div>
                  <StatusBadge value={lead.status} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{lead.message}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gray-400">{formatDateTime(lead.created_at)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Mapa de tarefas</p>
              <p className="mt-1 text-sm text-gray-500">Distribuicao rapida das entregas atuais.</p>
            </div>
            <button type="button" onClick={() => setActiveTab('execution')} className="text-sm font-medium text-[#0A0A0A]">
              Ver execucao
            </button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {taskStatuses.map((status) => (
              <div key={status} className="rounded-2xl border border-gray-100 p-4">
                <StatusBadge value={status} />
                <p className="mt-4 text-2xl font-bold tracking-tight text-[#0A0A0A]">
                  {(taskGroups[status] || []).length}
                </p>
                <p className="mt-1 text-sm text-gray-500">{status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const leadsSection = (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="rounded-[28px]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A]">Contatos recebidos</p>
            <p className="mt-1 text-sm text-gray-500">Qualifique, mova o status e transforme o lead em projeto.</p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {workspace?.leads.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => {
                setSelectedLeadId(lead.id);
                setLeadProjectForm(createProjectDraftFromLead(lead));
              }}
              className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                selectedLeadId === lead.id ? 'border-[#0A0A0A] bg-[#FAFAFA]' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-[#0A0A0A]">{lead.name}</p>
                  <p className="text-sm text-gray-500">
                    {lead.company || 'Sem empresa'} • {lead.email}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{lead.message}</p>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <StatusBadge value={lead.status} />
                  <span className="text-xs uppercase tracking-[0.18em] text-gray-400">{formatDateTime(lead.created_at)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="rounded-[28px]">
          <p className="text-sm font-semibold text-[#0A0A0A]">Lead selecionado</p>
          {selectedLead ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl bg-[#F5F5F5] p-4">
                <p className="text-lg font-semibold text-[#0A0A0A]">{selectedLead.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedLead.company || 'Sem empresa'} • {selectedLead.project_type}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{selectedLead.message}</p>
              </div>

              <Field label="Atualizar status">
                <select
                  value={selectedLead.status}
                  onChange={(event) =>
                    runAction(
                      `lead-status-${selectedLead.id}`,
                      () => workspaceApi.updateLeadStatus(selectedLead.id, event.target.value),
                      'Status do lead atualizado.',
                    )
                  }
                  className={inputClassName}
                >
                  {leadStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </Field>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Selecione um lead para trabalhar nele.</p>
          )}
        </Card>

        <Card className="rounded-[28px]">
          <p className="text-sm font-semibold text-[#0A0A0A]">Transformar em projeto</p>
          <p className="mt-1 text-sm text-gray-500">Use a ideia recebida como ponto de partida e jogue para a operacao.</p>
          {selectedLead ? (
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                runAction(
                  `convert-${selectedLead.id}`,
                  async () => {
                    const project = await workspaceApi.convertLeadToProject(selectedLead, leadProjectForm);
                    setActiveTab('projects');
                    setSelectedProjectId(project.id);
                  },
                  'Lead convertido em projeto com sucesso.',
                );
              }}
            >
              <Field label="Nome do projeto">
                <input
                  value={leadProjectForm.name}
                  onChange={(event) => setLeadProjectForm((current) => ({ ...current, name: event.target.value }))}
                  className={inputClassName}
                  required
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Prazo">
                  <input
                    type="date"
                    value={leadProjectForm.due_date}
                    onChange={(event) => setLeadProjectForm((current) => ({ ...current, due_date: event.target.value }))}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Orcamento total">
                  <input
                    type="number"
                    min="0"
                    value={leadProjectForm.budget_total}
                    onChange={(event) => setLeadProjectForm((current) => ({ ...current, budget_total: event.target.value }))}
                    className={inputClassName}
                    placeholder="0"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Responsavel">
                  <select
                    value={leadProjectForm.owner_id}
                    onChange={(event) => setLeadProjectForm((current) => ({ ...current, owner_id: event.target.value }))}
                    className={inputClassName}
                  >
                    <option value="">Selecionar</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.full_name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Prioridade">
                  <select
                    value={leadProjectForm.priority}
                    onChange={(event) => setLeadProjectForm((current) => ({ ...current, priority: event.target.value }))}
                    className={inputClassName}
                  >
                    {['Alta', 'Media', 'Baixa'].map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Resumo">
                <textarea
                  rows={4}
                  value={leadProjectForm.summary}
                  onChange={(event) => setLeadProjectForm((current) => ({ ...current, summary: event.target.value }))}
                  className={`${inputClassName} resize-none`}
                />
              </Field>
              <button
                type="submit"
                disabled={busyAction === `convert-${selectedLead.id}`}
                className="w-full rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900 disabled:opacity-70"
              >
                {busyAction === `convert-${selectedLead.id}` ? 'Convertendo...' : 'Criar projeto a partir deste lead'}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Selecione um lead para abrir o fluxo de conversao.</p>
          )}
        </Card>
      </div>
    </div>
  );

  const projectsSection = (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <Card className="rounded-[28px]">
          <p className="text-sm font-semibold text-[#0A0A0A]">Projetos em andamento</p>
          <div className="mt-5 space-y-3">
            {workspace?.projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                  selectedProjectId === project.id ? 'border-[#0A0A0A] bg-[#FAFAFA]' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-[#0A0A0A]">{project.name}</p>
                    <p className="text-sm text-gray-500">
                      {project.company || project.client_name} • {project.service_type}
                    </p>
                  </div>
                  <StatusBadge value={project.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-gray-400">
                  <span>Prazo {formatDate(project.due_date)}</span>
                  <span>{project.completion || 0}% entregue</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px]">
          <p className="text-sm font-semibold text-[#0A0A0A]">Novo projeto</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              runAction(
                'create-project',
                async () => {
                  const created = await workspaceApi.createProject(projectForm);
                  setProjectForm(createProjectForm());
                  setSelectedProjectId(created.id);
                },
                'Projeto criado com sucesso.',
              );
            }}
          >
            <Field label="Nome do projeto">
              <input
                value={projectForm.name}
                onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
                className={inputClassName}
                required
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Cliente">
                <input
                  value={projectForm.client_name}
                  onChange={(event) => setProjectForm((current) => ({ ...current, client_name: event.target.value }))}
                  className={inputClassName}
                  required
                />
              </Field>
              <Field label="E-mail do cliente">
                <input
                  type="email"
                  value={projectForm.client_email}
                  onChange={(event) => setProjectForm((current) => ({ ...current, client_email: event.target.value }))}
                  className={inputClassName}
                  required
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Empresa">
                <input
                  value={projectForm.company}
                  onChange={(event) => setProjectForm((current) => ({ ...current, company: event.target.value }))}
                  className={inputClassName}
                />
              </Field>
              <Field label="Tipo de servico">
                <input
                  value={projectForm.service_type}
                  onChange={(event) => setProjectForm((current) => ({ ...current, service_type: event.target.value }))}
                  className={inputClassName}
                />
              </Field>
            </div>
            <Field label="Resumo">
              <textarea
                rows={4}
                value={projectForm.summary}
                onChange={(event) => setProjectForm((current) => ({ ...current, summary: event.target.value }))}
                className={`${inputClassName} resize-none`}
                required
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Prazo">
                <input
                  type="date"
                  value={projectForm.due_date}
                  onChange={(event) => setProjectForm((current) => ({ ...current, due_date: event.target.value }))}
                  className={inputClassName}
                />
              </Field>
              <Field label="Orcamento">
                <input
                  type="number"
                  min="0"
                  value={projectForm.budget_total}
                  onChange={(event) => setProjectForm((current) => ({ ...current, budget_total: event.target.value }))}
                  className={inputClassName}
                />
              </Field>
              <Field label="Responsavel">
                <select
                  value={projectForm.owner_id}
                  onChange={(event) => setProjectForm((current) => ({ ...current, owner_id: event.target.value }))}
                  className={inputClassName}
                >
                  <option value="">Selecionar</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button
              type="submit"
              disabled={busyAction === 'create-project'}
              className="w-full rounded-xl border border-[#0A0A0A] px-6 py-4 font-medium text-[#0A0A0A] transition hover:bg-[#0A0A0A] hover:text-white disabled:opacity-70"
            >
              {busyAction === 'create-project' ? 'Criando...' : 'Criar projeto manualmente'}
            </button>
          </form>
        </Card>
      </div>

      <Card className="rounded-[28px]">
        <p className="text-sm font-semibold text-[#0A0A0A]">Gestao do projeto</p>
        {selectedProject ? (
          <form
            className="mt-5 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              runAction(
                `update-project-${selectedProject.id}`,
                () => workspaceApi.updateProject(selectedProject.id, selectedProject),
                'Projeto atualizado.',
              );
            }}
          >
            <div className="rounded-[24px] bg-[#F5F5F5] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-2xl font-bold tracking-tight text-[#0A0A0A]">{selectedProject.name}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedProject.client_name} • {selectedProject.client_email}
                  </p>
                </div>
                <StatusBadge value={selectedProject.priority || 'Media'} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Status">
                <select
                  value={selectedProject.status}
                  onChange={(event) =>
                    setWorkspace((current) => ({
                      ...current,
                      projects: current.projects.map((project) =>
                        project.id === selectedProject.id ? { ...project, status: event.target.value } : project,
                      ),
                    }))
                  }
                  className={inputClassName}
                >
                  {projectStatuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </Field>
              <Field label="Prioridade">
                <select
                  value={selectedProject.priority}
                  onChange={(event) =>
                    setWorkspace((current) => ({
                      ...current,
                      projects: current.projects.map((project) =>
                        project.id === selectedProject.id ? { ...project, priority: event.target.value } : project,
                      ),
                    }))
                  }
                  className={inputClassName}
                >
                  {['Alta', 'Media', 'Baixa'].map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Prazo">
                <input
                  type="date"
                  value={selectedProject.due_date || ''}
                  onChange={(event) =>
                    setWorkspace((current) => ({
                      ...current,
                      projects: current.projects.map((project) =>
                        project.id === selectedProject.id ? { ...project, due_date: event.target.value } : project,
                      ),
                    }))
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Conclusao (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedProject.completion || 0}
                  onChange={(event) =>
                    setWorkspace((current) => ({
                      ...current,
                      projects: current.projects.map((project) =>
                        project.id === selectedProject.id
                          ? { ...project, completion: Number(event.target.value) }
                          : project,
                      ),
                    }))
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Orcamento total">
                <input
                  type="number"
                  min="0"
                  value={selectedProject.budget_total || 0}
                  onChange={(event) =>
                    setWorkspace((current) => ({
                      ...current,
                      projects: current.projects.map((project) =>
                        project.id === selectedProject.id
                          ? { ...project, budget_total: Number(event.target.value) }
                          : project,
                      ),
                    }))
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Responsavel">
                <select
                  value={selectedProject.owner_id || ''}
                  onChange={(event) =>
                    setWorkspace((current) => ({
                      ...current,
                      projects: current.projects.map((project) =>
                        project.id === selectedProject.id ? { ...project, owner_id: event.target.value } : project,
                      ),
                    }))
                  }
                  className={inputClassName}
                >
                  <option value="">Selecionar</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Cliente / empresa">
                <input
                  value={selectedProject.company || ''}
                  onChange={(event) =>
                    setWorkspace((current) => ({
                      ...current,
                      projects: current.projects.map((project) =>
                        project.id === selectedProject.id ? { ...project, company: event.target.value } : project,
                      ),
                    }))
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field label="Resumo do projeto">
              <textarea
                rows={4}
                value={selectedProject.summary || ''}
                onChange={(event) =>
                  setWorkspace((current) => ({
                    ...current,
                    projects: current.projects.map((project) =>
                      project.id === selectedProject.id ? { ...project, summary: event.target.value } : project,
                    ),
                  }))
                }
                className={`${inputClassName} resize-none`}
              />
            </Field>
            <Field label="Observacoes do cliente">
              <textarea
                rows={4}
                value={selectedProject.client_notes || ''}
                onChange={(event) =>
                  setWorkspace((current) => ({
                    ...current,
                    projects: current.projects.map((project) =>
                      project.id === selectedProject.id ? { ...project, client_notes: event.target.value } : project,
                    ),
                  }))
                }
                className={`${inputClassName} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="rounded-[24px] bg-[#FAFAFA]">
                <p className="text-sm text-gray-500">Ramificacoes</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-[#0A0A0A]">{selectedProjectBranches.length}</p>
              </Card>
              <Card className="rounded-[24px] bg-[#FAFAFA]">
                <p className="text-sm text-gray-500">Tarefas</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-[#0A0A0A]">{selectedProjectTasks.length}</p>
              </Card>
              <Card className="rounded-[24px] bg-[#FAFAFA]">
                <p className="text-sm text-gray-500">Valor previsto</p>
                <p className="mt-3 text-2xl font-bold tracking-tight text-[#0A0A0A]">{formatCurrency(selectedProject.budget_total)}</p>
              </Card>
            </div>

            <button
              type="submit"
              disabled={busyAction === `update-project-${selectedProject.id}`}
              className="w-full rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900 disabled:opacity-70"
            >
              {busyAction === `update-project-${selectedProject.id}` ? 'Salvando...' : 'Salvar alteracoes do projeto'}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Selecione um projeto para gerenciar o escopo.</p>
        )}
      </Card>
    </div>
  );

  const executionSection = (
    <div className="space-y-6">
      <Card className="rounded-[28px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A]">Projeto para execucao</p>
            <p className="mt-1 text-sm text-gray-500">Crie ramificacoes, distribua tarefas e acompanhe responsaveis.</p>
          </div>
          <select
            value={selectedProjectId || ''}
            onChange={(event) => {
              setSelectedProjectId(event.target.value);
              setBranchForm(createBranchForm());
              setTaskForm(createTaskForm());
            }}
            className={`${inputClassName} max-w-md`}
          >
            <option value="">Selecionar projeto</option>
            {workspace?.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="rounded-[28px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Ramificacoes do projeto</p>
              <p className="mt-1 text-sm text-gray-500">Organize cada frente para separar responsabilidades.</p>
            </div>
          </div>
          {selectedProject ? (
            <>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  runAction(
                    'create-branch',
                    async () => {
                      await workspaceApi.createBranch({ ...branchForm, project_id: selectedProject.id });
                      setBranchForm(createBranchForm());
                    },
                    'Ramificacao criada com sucesso.',
                  );
                }}
              >
                <Field label="Nome da ramificacao">
                  <input
                    value={branchForm.name}
                    onChange={(event) => setBranchForm((current) => ({ ...current, name: event.target.value }))}
                    className={inputClassName}
                    required
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Field label="Responsavel">
                    <select
                      value={branchForm.owner_id}
                      onChange={(event) => setBranchForm((current) => ({ ...current, owner_id: event.target.value }))}
                      className={inputClassName}
                    >
                      <option value="">Selecionar</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select
                      value={branchForm.status}
                      onChange={(event) => setBranchForm((current) => ({ ...current, status: event.target.value }))}
                      className={inputClassName}
                    >
                      {branchStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Prazo">
                    <input
                      type="date"
                      value={branchForm.due_date}
                      onChange={(event) => setBranchForm((current) => ({ ...current, due_date: event.target.value }))}
                      className={inputClassName}
                    />
                  </Field>
                </div>
                <Field label="Resumo">
                  <textarea
                    rows={3}
                    value={branchForm.summary}
                    onChange={(event) => setBranchForm((current) => ({ ...current, summary: event.target.value }))}
                    className={`${inputClassName} resize-none`}
                  />
                </Field>
                <button
                  type="submit"
                  disabled={busyAction === 'create-branch'}
                  className="w-full rounded-xl border border-[#0A0A0A] px-6 py-4 font-medium text-[#0A0A0A] transition hover:bg-[#0A0A0A] hover:text-white disabled:opacity-70"
                >
                  {busyAction === 'create-branch' ? 'Criando...' : 'Criar ramificacao'}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {selectedProjectBranches.map((branch) => (
                  <div key={branch.id} className="rounded-[24px] border border-gray-100 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-[#0A0A0A]">{branch.name}</p>
                        <p className="text-sm text-gray-500">
                          {branch.summary || 'Sem resumo'} • {getMemberName(branch.owner_id)}
                        </p>
                      </div>
                      <select
                        value={branch.status}
                        onChange={(event) =>
                          runAction(
                            `branch-${branch.id}`,
                            () => workspaceApi.updateBranch(branch.id, { status: event.target.value }),
                            'Status da ramificacao atualizado.',
                          )
                        }
                        className={`${inputClassName} max-w-[190px]`}
                      >
                        {branchStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gray-400">Prazo {formatDate(branch.due_date)}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Selecione um projeto para dividir o trabalho em frentes.</p>
          )}
        </Card>

        <Card className="rounded-[28px]">
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A]">Tarefas e pessoas responsaveis</p>
            <p className="mt-1 text-sm text-gray-500">Distribua a execucao por etapa, prioridade e dono.</p>
          </div>
          {selectedProject ? (
            <>
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  runAction(
                    'create-task',
                    async () => {
                      await workspaceApi.createTask({ ...taskForm, project_id: selectedProject.id });
                      setTaskForm(createTaskForm());
                    },
                    'Tarefa criada com sucesso.',
                  );
                }}
              >
                <Field label="Titulo da tarefa">
                  <input
                    value={taskForm.title}
                    onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                    className={inputClassName}
                    required
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Ramificacao">
                    <select
                      value={taskForm.branch_id}
                      onChange={(event) => setTaskForm((current) => ({ ...current, branch_id: event.target.value }))}
                      className={inputClassName}
                    >
                      <option value="">Sem ramificacao</option>
                      {selectedProjectBranches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Responsavel">
                    <select
                      value={taskForm.assignee_id}
                      onChange={(event) => setTaskForm((current) => ({ ...current, assignee_id: event.target.value }))}
                      className={inputClassName}
                    >
                      <option value="">Selecionar</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <Field label="Status">
                    <select
                      value={taskForm.status}
                      onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))}
                      className={inputClassName}
                    >
                      {taskStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Prioridade">
                    <select
                      value={taskForm.priority}
                      onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}
                      className={inputClassName}
                    >
                      {['Alta', 'Media', 'Baixa'].map((priority) => (
                        <option key={priority}>{priority}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Horas">
                    <input
                      type="number"
                      min="0"
                      value={taskForm.estimated_hours}
                      onChange={(event) => setTaskForm((current) => ({ ...current, estimated_hours: event.target.value }))}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Prazo">
                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(event) => setTaskForm((current) => ({ ...current, due_date: event.target.value }))}
                      className={inputClassName}
                    />
                  </Field>
                </div>
                <button
                  type="submit"
                  disabled={busyAction === 'create-task'}
                  className="w-full rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900 disabled:opacity-70"
                >
                  {busyAction === 'create-task' ? 'Criando...' : 'Criar tarefa'}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {selectedProjectTasks.map((task) => (
                  <div key={task.id} className="rounded-[24px] border border-gray-100 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-[#0A0A0A]">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          {getMemberName(task.assignee_id)} • {task.estimated_hours || 0}h • {formatDate(task.due_date)}
                        </p>
                      </div>
                      <select
                        value={task.status}
                        onChange={(event) =>
                          runAction(
                            `task-${task.id}`,
                            () => workspaceApi.updateTask(task.id, { status: event.target.value }),
                            'Status da tarefa atualizado.',
                          )
                        }
                        className={`${inputClassName} max-w-[190px]`}
                      >
                        {taskStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <StatusBadge value={task.priority || 'Media'} />
                      {task.branch_id ? (
                        <span className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-medium text-gray-600">
                          {selectedProjectBranches.find((branch) => branch.id === task.branch_id)?.name || 'Ramificacao'}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Selecione um projeto para distribuir as tarefas.</p>
          )}
        </Card>
      </div>
    </div>
  );

  const financeSection = (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card className="rounded-[28px]">
            <p className="text-sm text-gray-500">Receita</p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-[#0A0A0A]">{formatCurrency(totalRevenue)}</p>
          </Card>
          <Card className="rounded-[28px]">
            <p className="text-sm text-gray-500">Despesa</p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-[#0A0A0A]">{formatCurrency(totalExpenses)}</p>
          </Card>
          <Card className="rounded-[28px]">
            <p className="text-sm text-gray-500">Divisao por socio</p>
            <p className="mt-4 text-3xl font-bold tracking-tight text-[#0A0A0A]">{formatCurrency(partnerSplit)}</p>
          </Card>
        </div>

        <Card className="rounded-[28px]">
          <p className="text-sm font-semibold text-[#0A0A0A]">Reparticao igualitaria</p>
          <p className="mt-1 text-sm text-gray-500">Lucro liquido dividido igualmente entre os socios cadastrados.</p>
          <div className="mt-5 space-y-3">
            {partnerMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F5F5] font-semibold text-[#0A0A0A]">
                    {getInitials(member.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A0A0A]">{member.full_name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <p className="font-semibold text-[#0A0A0A]">{formatCurrency(partnerSplit)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="rounded-[28px]">
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="xl:w-[360px] xl:shrink-0">
            <p className="text-sm font-semibold text-[#0A0A0A]">Nova movimentacao</p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                runAction(
                  'create-finance',
                  async () => {
                    await workspaceApi.createFinanceEntry(financeForm);
                    setFinanceForm(createFinanceForm());
                  },
                  'Movimentacao financeira registrada.',
                );
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
                <Field label="Tipo">
                  <select
                    value={financeForm.kind}
                    onChange={(event) => setFinanceForm((current) => ({ ...current, kind: event.target.value }))}
                    className={inputClassName}
                  >
                    <option>Receita</option>
                    <option>Despesa</option>
                  </select>
                </Field>
                <Field label="Projeto">
                  <select
                    value={financeForm.project_id}
                    onChange={(event) => setFinanceForm((current) => ({ ...current, project_id: event.target.value }))}
                    className={inputClassName}
                  >
                    <option value="">Sem vinculo</option>
                    {workspace?.projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Titulo">
                <input
                  value={financeForm.title}
                  onChange={(event) => setFinanceForm((current) => ({ ...current, title: event.target.value }))}
                  className={inputClassName}
                  required
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-1">
                <Field label="Valor">
                  <input
                    type="number"
                    min="0"
                    value={financeForm.amount}
                    onChange={(event) => setFinanceForm((current) => ({ ...current, amount: event.target.value }))}
                    className={inputClassName}
                    required
                  />
                </Field>
                <Field label="Categoria">
                  <input
                    value={financeForm.category}
                    onChange={(event) => setFinanceForm((current) => ({ ...current, category: event.target.value }))}
                    className={inputClassName}
                  />
                </Field>
                <Field label="Data">
                  <input
                    type="date"
                    value={financeForm.entry_date}
                    onChange={(event) => setFinanceForm((current) => ({ ...current, entry_date: event.target.value }))}
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field label="Notas">
                <textarea
                  rows={3}
                  value={financeForm.notes}
                  onChange={(event) => setFinanceForm((current) => ({ ...current, notes: event.target.value }))}
                  className={`${inputClassName} resize-none`}
                />
              </Field>
              <button
                type="submit"
                disabled={busyAction === 'create-finance'}
                className="w-full rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900 disabled:opacity-70"
              >
                {busyAction === 'create-finance' ? 'Registrando...' : 'Registrar movimentacao'}
              </button>
            </form>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#0A0A0A]">Historico financeiro</p>
            <div className="mt-5 space-y-3">
              {workspace?.finance_entries.map((entry) => (
                <div key={entry.id} className="rounded-[24px] border border-gray-100 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-[#0A0A0A]">{entry.title}</p>
                      <p className="text-sm text-gray-500">
                        {workspace.projects.find((project) => project.id === entry.project_id)?.name || 'Sem projeto'} • {entry.category || 'Sem categoria'}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge value={entry.kind} />
                      <p className="mt-2 font-semibold text-[#0A0A0A]">{formatCurrency(entry.amount)}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{entry.notes || 'Sem observacoes.'}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gray-400">{formatDate(entry.entry_date)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const completedSection = (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card className="rounded-[28px]">
        <p className="text-sm font-semibold text-[#0A0A0A]">Projetos concluidos</p>
        <div className="mt-5 space-y-3">
          {completedProjects.length ? (
            completedProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedCompletedProjectId(project.id)}
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                  selectedCompletedProjectId === project.id ? 'border-[#0A0A0A] bg-[#FAFAFA]' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-[#0A0A0A]">{project.name}</p>
                    <p className="text-sm text-gray-500">
                      {project.client_name} • {project.company || 'Cliente sem empresa'}
                    </p>
                  </div>
                  <StatusBadge value={project.status} />
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gray-400">
                  Concluido em {formatDate(project.completed_at || project.due_date)}
                </p>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhum projeto concluido ainda.</p>
          )}
        </div>
      </Card>

      <Card className="rounded-[28px]">
        <p className="text-sm font-semibold text-[#0A0A0A]">Documentacao do cliente</p>
        {selectedCompletedProject ? (
          <>
            <div className="mt-5 rounded-[24px] bg-[#F5F5F5] p-5">
              <p className="text-2xl font-bold tracking-tight text-[#0A0A0A]">{selectedCompletedProject.name}</p>
              <p className="mt-2 text-sm text-gray-500">
                {selectedCompletedProject.client_name} • {selectedCompletedProject.client_email}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{selectedCompletedProject.client_notes || selectedCompletedProject.summary}</p>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                runAction(
                  'create-document',
                  async () => {
                    await workspaceApi.createDocument({
                      project_id: selectedCompletedProject.id,
                      title: documentForm.title,
                      type: documentForm.type,
                      externalUrl: documentForm.externalUrl,
                      file: documentForm.file,
                    });
                    setDocumentForm(createDocumentForm());
                  },
                  'Documento registrado com sucesso.',
                );
              }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Titulo do documento">
                  <input
                    value={documentForm.title}
                    onChange={(event) => setDocumentForm((current) => ({ ...current, title: event.target.value }))}
                    className={inputClassName}
                    required
                  />
                </Field>
                <Field label="Tipo">
                  <input
                    value={documentForm.type}
                    onChange={(event) => setDocumentForm((current) => ({ ...current, type: event.target.value }))}
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field label="Link do documento" hint="No modo demo, use links. Com Supabase configurado voce tambem pode subir arquivos.">
                <input
                  value={documentForm.externalUrl}
                  onChange={(event) => setDocumentForm((current) => ({ ...current, externalUrl: event.target.value }))}
                  className={inputClassName}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Ou enviar arquivo">
                <input
                  type="file"
                  onChange={(event) => setDocumentForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                  className={`${inputClassName} file:mr-4 file:rounded-full file:border-0 file:bg-[#0A0A0A] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white`}
                />
              </Field>
              <button
                type="submit"
                disabled={busyAction === 'create-document'}
                className="w-full rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900 disabled:opacity-70"
              >
                {busyAction === 'create-document' ? 'Salvando...' : 'Adicionar documento'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {selectedProjectDocuments.length ? (
                selectedProjectDocuments.map((document) => (
                  <div key={document.id} className="rounded-[24px] border border-gray-100 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-[#0A0A0A]">{document.title}</p>
                        <p className="text-sm text-gray-500">{document.type}</p>
                      </div>
                      <a
                        href={document.file_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
                          document.file_url ? 'bg-[#0A0A0A] text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        Abrir
                      </a>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gray-400">{formatDateTime(document.uploaded_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum documento cadastrado para esse projeto.</p>
              )}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Selecione um projeto concluido para gerir cliente e documentos.</p>
        )}
      </Card>
    </div>
  );

  const teamSection = (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <Card className="rounded-[28px]">
        <p className="text-sm font-semibold text-[#0A0A0A]">Equipe e distribuicao</p>
        <div className="mt-5 space-y-3">
          {members.map((member) => (
            <div key={member.id} className="rounded-[24px] border border-gray-100 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5] font-semibold text-[#0A0A0A]">
                    {getInitials(member.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A0A0A]">{member.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {member.role} • {member.specialty || 'Sem especialidade definida'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {member.is_partner ? <StatusBadge value="Fechado" /> : null}
                  <span className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-medium text-gray-600">
                    Capacidade {member.workload_capacity}h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-[28px]">
        <p className="text-sm font-semibold text-[#0A0A0A]">Adicionar pessoa</p>
        <p className="mt-1 text-sm text-gray-500">Cadastre socios e pessoas da operacao para atribuir entregas.</p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            runAction(
              'create-member',
              async () => {
                await workspaceApi.createTeamMember(teamForm);
                setTeamForm(createTeamForm());
              },
              'Pessoa adicionada a equipe.',
            );
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome completo">
              <input
                value={teamForm.full_name}
                onChange={(event) => setTeamForm((current) => ({ ...current, full_name: event.target.value }))}
                className={inputClassName}
                required
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                value={teamForm.email}
                onChange={(event) => setTeamForm((current) => ({ ...current, email: event.target.value }))}
                className={inputClassName}
                required
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Papel">
              <select
                value={teamForm.role}
                onChange={(event) => setTeamForm((current) => ({ ...current, role: event.target.value }))}
                className={inputClassName}
              >
                {teamRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </Field>
            <Field label="Capacidade semanal">
              <input
                type="number"
                min="1"
                value={teamForm.workload_capacity}
                onChange={(event) => setTeamForm((current) => ({ ...current, workload_capacity: Number(event.target.value) }))}
                className={inputClassName}
              />
            </Field>
          </div>
          <Field label="Especialidade">
            <input
              value={teamForm.specialty}
              onChange={(event) => setTeamForm((current) => ({ ...current, specialty: event.target.value }))}
              className={inputClassName}
            />
          </Field>
          <label className="flex items-center gap-3 rounded-2xl border border-gray-100 px-4 py-4 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={teamForm.is_partner}
              onChange={(event) => setTeamForm((current) => ({ ...current, is_partner: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            Essa pessoa participa da reparticao financeira como socio
          </label>
          <button
            type="submit"
            disabled={busyAction === 'create-member'}
            className="w-full rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900 disabled:opacity-70"
          >
            {busyAction === 'create-member' ? 'Adicionando...' : 'Adicionar pessoa'}
          </button>
        </form>
      </Card>
    </div>
  );

  const sections = {
    overview: overviewSection,
    leads: leadsSection,
    projects: projectsSection,
    execution: executionSection,
    finance: financeSection,
    completed: completedSection,
    team: teamSection,
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 xl:flex-row">
        <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:w-[310px] xl:shrink-0">
          <Card className="flex h-full flex-col rounded-[36px] bg-[#0A0A0A] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0A0A0A]">
                <Code2 size={22} strokeWidth={2.3} />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">VexCoding</p>
                <p className="text-sm text-white/60">Workspace dos socios</p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white/65">Sessao ativa</p>
              <p className="mt-2 font-semibold">{session?.user?.user_metadata?.full_name || session?.user?.email}</p>
              <p className="mt-1 text-sm text-white/60">{session?.user?.email}</p>
            </div>

            <nav className="mt-8 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeTab === tab.id ? 'bg-white text-[#0A0A0A]' : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto space-y-3 pt-8">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/8"
              >
                Ver site publico
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await authApi.signOut();
                    onSessionChange(null);
                    navigateTo('/socios/login');
                  } catch (signOutError) {
                    setError(signOutError.message || 'Nao foi possivel sair.');
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#0A0A0A]"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </Card>
        </aside>

        <main className="min-w-0 flex-1">
          <Card className="rounded-[36px] p-6 md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">Workspace interno</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500 md:text-base">
                  Plataforma interna pronta para captar contatos do site, transformar oportunidades em projetos, dividir trabalho por ramificacoes, acompanhar prazos, centralizar documentos e controlar o financeiro da empresa.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="rounded-[24px] bg-[#FAFAFA] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Leads</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-[#0A0A0A]">{workspace?.leads.length || 0}</p>
                </Card>
                <Card className="rounded-[24px] bg-[#FAFAFA] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Projetos</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-[#0A0A0A]">{workspace?.projects.length || 0}</p>
                </Card>
                <Card className="rounded-[24px] bg-[#FAFAFA] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Equipe</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-[#0A0A0A]">{workspace?.members.length || 0}</p>
                </Card>
              </div>
            </div>

            {feedback ? <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{feedback}</div> : null}
            {error ? <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <div className="mt-8">{sections[activeTab]}</div>
          </Card>
        </main>
      </div>
    </div>
  );
};
