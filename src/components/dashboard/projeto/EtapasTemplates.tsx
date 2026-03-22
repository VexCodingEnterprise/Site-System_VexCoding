'use client';

import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import type { StageTemplate } from '@/types/dashboard';

export function EtapasTemplates({
  templates,
  onApplyTemplate,
}: {
  templates: StageTemplate[];
  onApplyTemplate: (template: StageTemplate) => void;
}) {
  return (
    <Panel>
      <SectionTitle title="Templates de etapas" description="Use uma trilha pronta e ajuste antes de publicar no portal." />
      <div className="divide-y divide-[var(--line)]">
        {templates.map((template) => (
          <div key={template.id} className="space-y-4 px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{template.name}</p>
                <p className="mt-1 text-sm muted">{template.projectType}</p>
              </div>
              {template.isDefault ? <StatusPill value="Padrão" /> : null}
            </div>
            <div className="panel-alt px-4 py-4">
              <p className="text-sm font-medium text-[var(--text)]">{template.steps.length} etapas configuradas</p>
              <p className="mt-1 text-sm muted">
                Ultima etapa prevista para +{Math.max(...template.steps.map((step) => step.daysFromStart), 0)} dias.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onApplyTemplate(template)}
              className="h-12 w-full border border-[var(--line)] bg-[var(--panel-alt)] text-sm font-medium"
            >
              Usar template
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
