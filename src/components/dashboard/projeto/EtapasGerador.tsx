'use client';

import { Sparkles } from 'lucide-react';
import { Panel, SectionTitle } from '@/components/dashboard/common';
import type { ProjectChecklist } from '@/types/dashboard';

export function EtapasGerador({
  checklist,
  onGenerate,
}: {
  checklist: ProjectChecklist | null;
  onGenerate: () => void;
}) {
  return (
    <Panel>
      <SectionTitle title="Geracao automatica" description="Analisa o checklist preenchido e sugere uma trilha de prazos para o cliente." />
      <div className="space-y-4 p-4">
        <div className="panel-alt px-4 py-4 text-sm muted">
          {checklist?.status === 'completo'
            ? 'Checklist completo. A IA local da VexCoding ja pode sugerir etapas e datas proporcionais ao escopo.'
            : 'Assim que o checklist avancar, voce pode gerar etapas automaticamente com base no tipo e na complexidade do projeto.'}
        </div>
        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex h-12 w-full items-center justify-center gap-2 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)]"
        >
          <Sparkles size={16} />
          Gerar etapas automaticamente
        </button>
      </div>
    </Panel>
  );
}
