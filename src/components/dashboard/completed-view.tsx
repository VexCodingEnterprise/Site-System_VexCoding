'use client';

import Link from 'next/link';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { formatCurrency, formatDate } from '@/lib/utils';

export function CompletedView() {
  const { workspace } = useDashboard();

  if (!workspace) {
    return null;
  }

  const completedProjects = workspace.projects.filter((project) => project.status === 'Concluido');

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {completedProjects.map((project) => (
        <Link key={project.id} href={`/dashboard/projetos/${project.id}`} className="panel block transition hover:border-[var(--line-strong)]">
          <SectionTitle title={project.name} description={`${project.clientName} • ${project.type}`} />
          <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
            <div className="bg-[var(--panel)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] muted">Valor</p>
              <p className="mt-2 text-sm font-medium">{formatCurrency(project.valueTotal)}</p>
            </div>
            <div className="bg-[var(--panel)] px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] muted">Concluido em</p>
              <p className="mt-2 text-sm font-medium">{formatDate(project.concludedAt)}</p>
            </div>
          </div>
          <div className="space-y-3 px-4 py-4">
            <StatusPill value={project.status} />
            <p className="text-sm leading-7 muted">{project.description}</p>
            {project.testimonial ? (
              <blockquote className="border-l-2 border-[var(--line-strong)] pl-3 text-sm italic muted">
                &ldquo;{project.testimonial}&rdquo;
              </blockquote>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
