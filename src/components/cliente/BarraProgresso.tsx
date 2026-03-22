'use client';

import { Check } from 'lucide-react';
import { calcularPosicao, calcularProgressoLinha, getTimelineBounds } from '@/lib/calcularPosicaoEtapa';
import { cn, formatDate } from '@/lib/utils';
import type { ClientPortalStage } from '@/types/dashboard';

export function BarraProgresso({
  stages,
  projectStart,
  projectEnd,
  compact = false,
}: {
  stages: ClientPortalStage[];
  projectStart: string;
  projectEnd: string;
  compact?: boolean;
}) {
  const orderedStages = [...stages].sort((a, b) => a.order - b.order);

  if (!orderedStages.length) {
    return (
      <div className="panel px-4 py-6 text-sm muted">
        Nenhuma etapa cadastrada ainda para o portal do cliente.
      </div>
    );
  }

  const timeline = getTimelineBounds(orderedStages, projectStart, projectEnd);
  const progress = calcularProgressoLinha(orderedStages, new Date(), timeline.start, timeline.end);
  const activeStage =
    orderedStages.find((stage) => stage.status === 'em_andamento') ||
    orderedStages.find((stage) => stage.status === 'pendente') ||
    null;

  return (
    <div className="panel overflow-hidden">
      <div className={cn('border-b border-[var(--line)] px-4 py-4', compact ? 'text-sm' : '')}>
        <p className="font-semibold text-[var(--text)]">Linha de progresso</p>
        <p className="mt-1 text-sm muted">
          Posicionamento proporcional por data prevista de cada etapa.
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className={cn('relative min-w-[760px] px-6 pb-6 pt-8', compact ? 'min-w-[680px]' : 'min-w-[920px]')}>
          <div className="absolute left-6 right-6 top-[46px] h-px bg-[var(--line)]" />
          <div className="absolute left-6 top-[46px] h-px bg-[var(--text)]" style={{ width: `${progress}%` }} />

          {orderedStages.map((stage) => {
            const position = calcularPosicao(new Date(stage.dueDate), timeline.start, timeline.end);
            const isCompleted = stage.status === 'concluida';
            const isCurrent = activeStage?.id === stage.id && stage.status !== 'concluida';

            return (
              <div
                key={stage.id}
                className="absolute -translate-x-1/2"
                style={{ left: `calc(${position}% + 24px)`, top: '24px' }}
              >
                <div
                  className={cn(
                    'mx-auto flex h-11 w-11 items-center justify-center border text-[var(--text)]',
                    isCompleted && 'border-[var(--text)] bg-[var(--text)] text-white',
                    isCurrent && 'border-[var(--text)] bg-[var(--panel)] shadow-[0_0_0_4px_rgba(10,10,10,0.06)] animate-pulse',
                    !isCompleted && !isCurrent && 'border-[var(--line-strong)] bg-[var(--panel)] text-[var(--muted)]',
                  )}
                >
                  {isCompleted ? <Check size={16} /> : <span className="h-2.5 w-2.5 rounded-full bg-current" />}
                </div>

                <div className="mt-4 w-[150px] -translate-x-[54px] text-center">
                  <p
                    className={cn(
                      'text-sm',
                      isCompleted || isCurrent ? 'font-semibold text-[var(--text)]' : 'font-medium text-[var(--muted)]',
                    )}
                  >
                    {stage.name}
                  </p>
                  <p className="mt-1 text-xs muted">{formatDate(stage.dueDate)}</p>
                  {isCurrent ? (
                    <span className="mt-2 inline-flex border border-[var(--text)] px-2 py-1 text-[11px] font-medium text-[var(--text)]">
                      Em andamento
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}

          <div style={{ height: compact ? 180 : 200 }} />
        </div>
      </div>
    </div>
  );
}
