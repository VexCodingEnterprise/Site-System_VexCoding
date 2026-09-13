'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Plus } from 'lucide-react';
import { branchTemplates, projectStatusOptions, taskPriorityOptions, taskStatusOptions } from '@/data/demo';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { ChecklistBuilder } from '@/components/dashboard/projeto/ChecklistBuilder';
import { PortalClienteAba } from '@/components/dashboard/projeto/PortalClienteAba';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { formatCurrency, formatDate, formatDateTime, groupBy, sumBy } from '@/lib/utils';

const chartColors = ['#0A0A0A', '#444444', '#7A7A7A'];

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const {
    workspace,
    mode,
    updateProject,
    createBranch,
    createTask,
    updateTask,
    createFinanceEntry,
    createDocument,
    uploadDocumentFile,
  } = useDashboard();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'finance' | 'documents' | 'checklist' | 'clientPortal'>('overview');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState(branchTemplates[0]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigneeId: 'rafael' as const,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
    priority: taskPriorityOptions[1],
    status: taskStatusOptions[0],
  });
  const [financeForm, setFinanceForm] = useState({
    description: '',
    value: 0,
    type: 'Entrada' as const,
    status: 'Pendente' as const,
    date: new Date().toISOString().slice(0, 10),
  });
  const [documentForm, setDocumentForm] = useState({
    name: '',
    fileUrl: '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [testimonial, setTestimonial] = useState('');
  const [useAsCase, setUseAsCase] = useState(false);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);

  const project = workspace?.projects.find((item) => item.id === projectId);
  const branches = useMemo(
    () => workspace?.branches.filter((item) => item.projectId === projectId) || [],
    [workspace?.branches, projectId],
  );
  const tasks = useMemo(
    () => workspace?.tasks.filter((item) => item.projectId === projectId) || [],
    [workspace?.tasks, projectId],
  );
  const finance = useMemo(
    () => workspace?.finance.filter((item) => item.projectId === projectId) || [],
    [workspace?.finance, projectId],
  );
  const documents = useMemo(
    () => workspace?.documents.filter((item) => item.projectId === projectId) || [],
    [workspace?.documents, projectId],
  );
  const history = useMemo(
    () => workspace?.statusHistory.filter((item) => item.projectId === projectId) || [],
    [workspace?.statusHistory, projectId],
  );
  const firstBranchId = branches[0]?.id || null;

  const selectedBranch = branches.find((item) => item.id === selectedBranchId) || branches[0] || null;
  const branchTasks = selectedBranch ? tasks.filter((task) => task.branchId === selectedBranch.id) : tasks;

  const groupedBranchTasks = useMemo(
    () => groupBy(branchTasks, (task) => task.status),
    [branchTasks],
  );

  useEffect(() => {
    if (!project) {
      return;
    }

    setSelectedBranchId((current) => current || firstBranchId);
    setTestimonial(project.testimonial || '');
    setUseAsCase(project.useAsCase);
  }, [project, firstBranchId]);

  if (!workspace || !project) {
    return null;
  }

  const progress = tasks.length ? Math.round((tasks.filter((task) => task.status === 'Concluido').length / tasks.length) * 100) : 0;

  const teamDistribution = project.partnerIds.map((partnerId) => {
    const partner = workspace.partners.find((item) => item.id === partnerId)!;
    const assignedTasks = tasks.filter((task) => task.assigneeId === partnerId);
    return {
      name: partner.displayName.split(' ')[0],
      total: assignedTasks.length,
      percentage: tasks.length ? Math.round((assignedTasks.length / tasks.length) * 100) : 0,
    };
  });

  const payments = finance
    .filter((entry) => entry.type !== 'Despesa')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-4">
      <Panel>
        <SectionTitle title={project.name} description={`${project.clientName} • ${project.type}`} />
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-4">
          <div className="panel-alt px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Status</p>
            <div className="mt-3">
              <StatusPill value={project.status} />
            </div>
          </div>
          <div className="panel-alt px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Prazo</p>
            <p className="mt-3 text-sm font-medium">{formatDate(project.dueDate)}</p>
          </div>
          <div className="panel-alt px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Valor</p>
            <p className="mt-3 text-sm font-medium">{formatCurrency(project.valueTotal)}</p>
          </div>
          <div className="panel-alt px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Progresso geral</p>
            <p className="mt-3 text-sm font-medium">{progress}%</p>
          </div>
        </div>
        <div className="border-t border-[var(--line)] px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {[
              ['overview', 'Visão geral'],
              ['tasks', 'Ramificacoes e Tarefas'],
              ['team', 'Equipe'],
              ['finance', 'Financeiro do Projeto'],
              ['documents', 'Documentos'],
              ['checklist', 'Checklist'],
              ['clientPortal', 'Portal do Cliente'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`border px-3 py-2 text-sm ${
                  activeTab === id ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--line)] bg-[var(--panel)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel>
            <SectionTitle title="Visão geral" description="Resumo executivo do projeto." />
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Status atual</span>
                  <select
                    value={project.status}
                    onChange={(event) =>
                      void updateProject(project.id, {
                        status: event.target.value as typeof project.status,
                        concludedAt: event.target.value === 'Concluido' ? new Date().toISOString() : null,
                      })
                    }
                    className="field"
                  >
                    {projectStatusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Progresso</span>
                  <div className="panel-alt px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{progress}% concluído</span>
                      <span>{tasks.filter((task) => task.status === 'Concluido').length}/{tasks.length} tarefas</span>
                    </div>
                    <div className="mt-3 h-2 bg-[var(--panel)]">
                      <div className="h-2 bg-[var(--text)]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel-alt px-4 py-4">
                <p className="text-sm font-medium">Descricao</p>
                <p className="mt-2 whitespace-pre-wrap leading-7 muted">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="panel-alt px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] muted">Cliente</p>
                  <p className="mt-2 text-sm font-medium">{project.clientName}</p>
                  <p className="mt-1 text-sm muted">{project.clientEmail}</p>
                </div>
                <div className="panel-alt px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] muted">Recebido</p>
                  <p className="mt-2 text-sm font-medium">{formatCurrency(project.valueReceived)}</p>
                </div>
                <div className="panel-alt px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] muted">A receber</p>
                  <p className="mt-2 text-sm font-medium">{formatCurrency(project.valueTotal - project.valueReceived)}</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionTitle title="Historico de status" description="Ultimas mudancas registradas." />
            <div className="divide-y divide-[var(--line)]">
              {history.map((item) => (
                <div key={item.id} className="px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <StatusPill value={item.status} />
                    <span className="text-xs muted">{formatDateTime(item.changedAt)}</span>
                  </div>
                  <p className="mt-2 text-sm muted">
                    Alterado por {workspace.partners.find((partner) => partner.id === item.changedBy)?.displayName}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_1fr]">
          <Panel>
            <SectionTitle title="Ramificações" description="Módulos do projeto." />
            <div className="space-y-2 p-4">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`w-full border px-3 py-3 text-left text-sm ${
                    (selectedBranch?.id || branches[0]?.id) === branch.id
                      ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                      : 'border-[var(--line)] bg-[var(--panel)]'
                  }`}
                >
                  {branch.name}
                </button>
              ))}
            </div>
            <div className="border-t border-[var(--line)] p-4">
              <div className="space-y-3">
                <select value={branchName} onChange={(event) => setBranchName(event.target.value)} className="field">
                  {branchTemplates.map((template) => (
                    <option key={template}>{template}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    void createBranch({
                      projectId: project.id,
                      name: branchName,
                      order: branches.length + 1,
                    })
                  }
                  className="flex h-11 w-full items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel-alt)] text-sm font-medium"
                >
                  <Plus size={16} />
                  Nova ramificacao
                </button>
              </div>
            </div>
          </Panel>

          <div className="space-y-4">
            <Panel>
              <SectionTitle title="Nova tarefa" description="Crie tarefas dentro da ramificacao selecionada." />
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
                <input className="field" placeholder="Titulo" value={newTask.title} onChange={(event) => setNewTask((current) => ({ ...current, title: event.target.value }))} />
                <select className="field" value={newTask.assigneeId} onChange={(event) => setNewTask((current) => ({ ...current, assigneeId: event.target.value as typeof current.assigneeId }))}>
                  {project.partnerIds.map((partnerId) => {
                    const partner = workspace.partners.find((item) => item.id === partnerId);
                    return (
                      <option key={partnerId} value={partnerId}>
                        {partner?.displayName}
                      </option>
                    );
                  })}
                </select>
                <input className="field" type="date" value={newTask.dueDate} onChange={(event) => setNewTask((current) => ({ ...current, dueDate: event.target.value }))} />
                <select className="field" value={newTask.priority} onChange={(event) => setNewTask((current) => ({ ...current, priority: event.target.value as typeof current.priority }))}>
                  {taskPriorityOptions.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
                <textarea className="field md:col-span-2 xl:col-span-3" rows={3} placeholder="Descricao" value={newTask.description} onChange={(event) => setNewTask((current) => ({ ...current, description: event.target.value }))} />
                <button
                  type="button"
                  onClick={() =>
                    selectedBranch &&
                    void createTask({
                      projectId: project.id,
                      branchId: selectedBranch.id,
                      title: newTask.title,
                      description: newTask.description,
                      assigneeId: newTask.assigneeId,
                      dueDate: newTask.dueDate,
                      priority: newTask.priority,
                      status: newTask.status,
                    })
                  }
                  className="h-11 border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)]"
                >
                  Criar tarefa
                </button>
              </div>
            </Panel>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              {taskStatusOptions.map((status) => (
                <Panel
                  key={status}
                  className="min-h-[360px]"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragTaskId) {
                      void updateTask(dragTaskId, { status });
                    }
                  }}
                >
                  <SectionTitle title={status} description={`${(groupedBranchTasks[status] || []).length} tarefas`} />
                  <div className="space-y-3 p-3">
                    {(groupedBranchTasks[status] || []).map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        draggable
                        onDragStart={() => setDragTaskId(task.id)}
                        className="w-full border border-[var(--line)] bg-[var(--panel-alt)] px-3 py-3 text-left"
                      >
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="mt-2 text-xs muted">{task.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusPill value={task.priority} />
                          <span className="text-xs muted">{formatDate(task.dueDate)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
          <Panel>
            <SectionTitle title="Sócios envolvidos" description="Carga por sócio dentro do projeto." />
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
              {teamDistribution.map((partner) => (
                <div key={partner.name} className="panel-alt px-4 py-4">
                  <p className="text-sm font-medium">{partner.name}</p>
                  <p className="mt-3 text-4xl font-semibold">{partner.percentage}%</p>
                  <p className="mt-2 text-sm muted">{partner.total} tarefas</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionTitle title="Distribuição" description="Carga visual por sócio." />
            <div className="h-[320px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={teamDistribution} dataKey="total" nameKey="name" innerRadius={60} outerRadius={95}>
                    {teamDistribution.map((item, index) => (
                      <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
          <Panel>
            <SectionTitle title="Financeiro do projeto" description="Entrada, saldo e historico de pagamentos." />
            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
              <div className="panel-alt px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] muted">Valor total</p>
                <p className="mt-3 text-lg font-semibold">{formatCurrency(project.valueTotal)}</p>
              </div>
              <div className="panel-alt px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] muted">Recebido</p>
                <p className="mt-3 text-lg font-semibold">{formatCurrency(project.valueReceived)}</p>
              </div>
              <div className="panel-alt px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] muted">A receber</p>
                <p className="mt-3 text-lg font-semibold">{formatCurrency(project.valueTotal - project.valueReceived)}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                {finance.map((entry) => (
                  <div key={entry.id} className="panel-alt px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm muted">{formatDate(entry.date)}</p>
                      </div>
                      <div className="text-right">
                        <StatusPill value={entry.status} />
                        <p className="mt-2 font-medium">{formatCurrency(entry.value)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="panel-alt p-4">
                <p className="text-sm font-medium">Curva de recebimento</p>
                <div className="mt-4 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={payments}>
                      <CartesianGrid stroke="var(--line)" vertical={false} />
                      <Tooltip />
                      <Area dataKey="value" stroke="#0A0A0A" fill="#0A0A0A" fillOpacity={0.16} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-4 text-sm muted">
                  Divisão igual por sócio envolvido: {formatCurrency(project.partnerIds.length ? project.valueTotal / project.partnerIds.length : 0)}
                </p>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionTitle title="Novo pagamento" description="Adicione entrada, saldo ou despesa." />
            <div className="space-y-4 p-4">
              <input className="field" placeholder="Descricao" value={financeForm.description} onChange={(event) => setFinanceForm((current) => ({ ...current, description: event.target.value }))} />
              <input className="field" type="number" placeholder="Valor" value={financeForm.value} onChange={(event) => setFinanceForm((current) => ({ ...current, value: Number(event.target.value) }))} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <select className="field" value={financeForm.type} onChange={(event) => setFinanceForm((current) => ({ ...current, type: event.target.value as typeof current.type }))}>
                  <option>Entrada</option>
                  <option>Saldo</option>
                  <option>Despesa</option>
                </select>
                <select className="field" value={financeForm.status} onChange={(event) => setFinanceForm((current) => ({ ...current, status: event.target.value as typeof current.status }))}>
                  <option>Recebido</option>
                  <option>Pendente</option>
                </select>
              </div>
              <input className="field" type="date" value={financeForm.date} onChange={(event) => setFinanceForm((current) => ({ ...current, date: event.target.value }))} />
              <button
                type="button"
                onClick={() =>
                  void createFinanceEntry({
                    projectId: project.id,
                    description: financeForm.description,
                    value: financeForm.value,
                    type: financeForm.type,
                    status: financeForm.status,
                    date: financeForm.date,
                  })
                }
                className="h-11 w-full border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)]"
              >
                Salvar pagamento
              </button>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
          <Panel>
            <SectionTitle title="Documentos" description="Arquivos do cliente, contrato e aprovacoes." />
            <div className="divide-y divide-[var(--line)]">
              {documents.map((document) => (
                <div key={document.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{document.name}</p>
                    <p className="text-sm muted">{formatDateTime(document.uploadedAt)}</p>
                  </div>
                  <a href={document.fileUrl} target="_blank" rel="noreferrer" className="border border-[var(--line)] px-3 py-2 text-sm font-medium">
                    Download
                  </a>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionTitle title="Upload rápido" description="Envie arquivos para o Supabase Storage ou use documentos externos." />
            <div className="space-y-4 p-4">
              <input className="field" placeholder="Nome do documento" value={documentForm.name} onChange={(event) => setDocumentForm((current) => ({ ...current, name: event.target.value }))} />
              {mode === 'official' ? (
                <input
                  className="field"
                  type="file"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
                />
              ) : null}
              <input className="field" placeholder="URL do arquivo" value={documentForm.fileUrl} onChange={(event) => setDocumentForm((current) => ({ ...current, fileUrl: event.target.value }))} />
              <button
                type="button"
                disabled={!documentForm.name || (mode === 'official' ? !documentFile && !documentForm.fileUrl : !documentForm.fileUrl)}
                onClick={() =>
                  void (async () => {
                    if (mode === 'official' && documentFile) {
                      const upload = await uploadDocumentFile(project.id, documentFile);
                      await createDocument({
                        projectId: project.id,
                        name: documentForm.name || upload.name,
                        fileUrl: upload.fileUrl,
                        filePath: upload.filePath,
                        uploadedAt: new Date().toISOString(),
                      });
                      setDocumentFile(null);
                      setDocumentForm({ name: '', fileUrl: '' });
                      return;
                    }

                    await createDocument({
                      projectId: project.id,
                      name: documentForm.name,
                      fileUrl: documentForm.fileUrl,
                      filePath: null,
                      uploadedAt: new Date().toISOString(),
                    });
                    setDocumentForm({ name: '', fileUrl: '' });
                  })()
                }
                className="h-11 w-full border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mode === 'official' ? 'Enviar documento' : 'Adicionar documento'}
              </button>
              <p className="text-xs muted">
                {mode === 'official'
                  ? 'Os arquivos enviados aqui vão para o Supabase Storage e ficam vinculados ao projeto.'
                  : 'No modo demo use um link manual para simular o documento.'}
              </p>
              <div className="panel-alt px-4 py-4">
                <p className="text-sm font-medium">Depoimento do cliente</p>
                <textarea className="field mt-3" rows={4} value={testimonial || project.testimonial || ''} onChange={(event) => setTestimonial(event.target.value)} />
                <label className="mt-3 flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={useAsCase} onChange={(event) => setUseAsCase(event.target.checked)} />
                  Marcar para possível case público após autorização
                </label>
                <button
                  type="button"
                  onClick={() => void updateProject(project.id, { testimonial, useAsCase })}
                  className="mt-3 h-11 w-full border border-[var(--line)] bg-[var(--panel)] text-sm font-medium"
                >
                  Salvar case
                </button>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'checklist' && <ChecklistBuilder projectId={project.id} />}

      {activeTab === 'clientPortal' && (
        <PortalClienteAba projectId={project.id} />
      )}
    </div>
  );
}
