'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BarraProgresso } from '@/components/cliente/BarraProgresso';
import { DocumentosLista } from '@/components/cliente/DocumentosLista';
import { FeedAtualizacoes } from '@/components/cliente/FeedAtualizacoes';
import { useClientePortal } from '@/components/cliente/cliente-portal-provider';
import { formatDate, formatDateTime } from '@/lib/utils';

export function ClienteDashboardPage() {
  const { snapshot, loading } = useClientePortal();

  if (loading || !snapshot) {
    return <div className="panel px-4 py-6 text-sm muted">Carregando portal do cliente...</div>;
  }

  const daysRemaining = Math.max(
    Math.ceil((new Date(snapshot.project.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    0,
  );

  return (
    <div className="space-y-4">
      <section className="panel">
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] muted">Projeto</p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">{snapshot.project.name}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 muted">{snapshot.project.description}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="panel-alt px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] muted">Tipo do projeto</p>
              <p className="mt-2 text-sm font-medium">{snapshot.project.type}</p>
            </div>
            <div className="panel-alt px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] muted">Sócio responsável</p>
              <p className="mt-2 text-sm font-medium">{snapshot.responsiblePartner?.displayName || 'Equipe VexCoding'}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-px border-t border-[var(--line)] bg-[var(--line)] md:grid-cols-4">
          <div className="bg-[var(--panel)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Inicio</p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(snapshot.project.createdAt)}</p>
          </div>
          <div className="bg-[var(--panel)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Prazo</p>
            <p className="mt-2 text-sm font-medium">{formatDate(snapshot.project.dueDate)}</p>
          </div>
          <div className="bg-[var(--panel)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Dias restantes</p>
            <p className="mt-2 text-sm font-medium">{daysRemaining} dias</p>
          </div>
          <div className="bg-[var(--panel)] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] muted">Cliente</p>
            <p className="mt-2 text-sm font-medium">{snapshot.client.name}</p>
          </div>
        </div>
      </section>

      <BarraProgresso
        stages={snapshot.stages}
        projectStart={snapshot.project.createdAt}
        projectEnd={snapshot.project.dueDate}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <FeedAtualizacoes updates={snapshot.updates} limit={10} />

        <div className="space-y-4">
          <DocumentosLista documents={snapshot.documents.slice(0, 4)} />
          <div className="panel px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[var(--text)]">Acessos rapidos</p>
                <p className="mt-1 text-sm muted">Continue acompanhando o projeto pela área do cliente.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <Link href="/cliente/dashboard/mensagens" className="flex items-center justify-between border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm font-medium">
                Conversar com a equipe <ArrowRight size={15} />
              </Link>
              <Link href="/cliente/dashboard/checklist" className="flex items-center justify-between border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm font-medium">
                Preencher checklist <ArrowRight size={15} />
              </Link>
              <Link href="/cliente/dashboard/documentos" className="flex items-center justify-between border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm font-medium">
                Ver todos os documentos <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
