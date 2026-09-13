'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Panel({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={cn('panel', className)} {...props}>
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--line)] px-4 py-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
        {description ? <p className="mt-1 text-sm muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ value }: { value: string }) {
  const labels: Record<string, string> = {
    Execucao: 'Execução',
    'Em aprovacao': 'Em aprovação',
    Concluido: 'Concluído',
    Media: 'Média',
    'Nao enviado': 'Não enviado',
    'Nao criado': 'Não criado',
    em_andamento: 'Em andamento',
    concluida: 'Concluída',
  };
  const palette: Record<string, string> = {
    Novo: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    Qualificado: 'bg-blue-100 text-blue-900 border-blue-300',
    'Em proposta': 'bg-orange-100 text-orange-900 border-orange-300',
    Fechado: 'bg-red-100 text-red-900 border-red-300',
    Convertido: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    Briefing: 'bg-slate-100 text-slate-900 border-slate-300',
    Execucao: 'bg-blue-100 text-blue-900 border-blue-300',
    'Em aprovacao': 'bg-orange-100 text-orange-900 border-orange-300',
    Concluido: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    Pausado: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    Backlog: 'bg-slate-100 text-slate-900 border-slate-300',
    'Em andamento': 'bg-blue-100 text-blue-900 border-blue-300',
    Bloqueado: 'bg-red-100 text-red-900 border-red-300',
    Recebido: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    Pendente: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    Alta: 'bg-red-100 text-red-900 border-red-300',
    Media: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    Baixa: 'bg-slate-100 text-slate-900 border-slate-300',
    'Nao enviado': 'bg-zinc-100 text-zinc-900 border-zinc-300',
    'Aguardando cliente': 'bg-yellow-100 text-yellow-900 border-yellow-300',
    'Em preenchimento': 'bg-blue-100 text-blue-900 border-blue-300',
    Completo: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    'Nao criado': 'bg-zinc-100 text-zinc-900 border-zinc-300',
    Padrão: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    'Em uso': 'bg-blue-100 text-blue-900 border-blue-300',
    pendente: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    em_andamento: 'bg-blue-100 text-blue-900 border-blue-300',
    concluida: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  };

  return (
    <span className={cn('inline-flex items-center border px-2 py-1 text-xs font-medium', palette[value] || 'bg-slate-100 text-slate-900 border-slate-300')}>
      {labels[value] || value}
    </span>
  );
}
