'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { projectStatusOptions, projectTypeOptions } from '@/data/demo';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { formatCurrency, formatDate } from '@/lib/utils';

export function ProjectsView() {
  const { workspace, createProject, actionLoading } = useDashboard();
  const [form, setForm] = useState({
    name: '',
    clientName: '',
    clientEmail: '',
    company: '',
    type: projectTypeOptions[0],
    description: '',
    valueTotal: 18000,
    valueReceived: 9000,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().slice(0, 10),
    status: projectStatusOptions[0],
    partnerIds: ['rafael', 'lourenzo'] as Array<'rafael' | 'lourenzo'>,
  });

  if (!workspace) {
    return null;
  }

  const projectProgress = (projectId: string) => {
    const tasks = workspace.tasks.filter((task) => task.projectId === projectId);
    if (!tasks.length) return 0;
    const completed = tasks.filter((task) => task.status === 'Concluido').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="space-y-4">
      <Panel>
        <SectionTitle
          title="Novo projeto"
          description="Crie um projeto manualmente ou converta um lead na tela de leads."
          action={
            <button
              type="button"
              onClick={() => void createProject(form)}
              disabled={actionLoading || !form.name || !form.clientName || !form.clientEmail}
              className="inline-flex h-10 items-center gap-2 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] disabled:opacity-60"
            >
              <Plus size={16} />
              Novo projeto
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          <input className="field" placeholder="Nome do projeto" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <input className="field" placeholder="Cliente" value={form.clientName} onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))} />
          <input className="field" placeholder="E-mail do cliente" value={form.clientEmail} onChange={(event) => setForm((current) => ({ ...current, clientEmail: event.target.value }))} />
          <select className="field" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
            {projectTypeOptions.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {workspace.projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projetos/${project.id}`} className="panel block border transition hover:border-[var(--line-strong)]">
            <div className="border-b border-[var(--line)] px-4 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm muted">
                    {project.clientName} • {project.type}
                  </p>
                </div>
                <StatusPill value={project.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
              <div className="bg-[var(--panel)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] muted">Prazo</p>
                <p className="mt-2 text-sm font-medium">{formatDate(project.dueDate)}</p>
              </div>
              <div className="bg-[var(--panel)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] muted">Valor</p>
                <p className="mt-2 text-sm font-medium">{formatCurrency(project.valueTotal)}</p>
              </div>
            </div>
            <div className="space-y-3 px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="muted">Progresso</span>
                <span>{projectProgress(project.id)}%</span>
              </div>
              <div className="h-2 w-full bg-[var(--panel-alt)]">
                <div className="h-2 bg-[var(--text)]" style={{ width: `${projectProgress(project.id)}%` }} />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {project.partnerIds.map((partnerId) => {
                  const partner = workspace.partners.find((item) => item.id === partnerId);
                  if (!partner) return null;
                  return (
                    <span key={partnerId} className="border border-[var(--line)] px-2 py-1 text-xs muted">
                      {partner.displayName.split(' ')[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
