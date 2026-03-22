'use client';

import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import type { ChecklistTemplate } from '@/types/dashboard';

export function ChecklistTemplates({
  templates,
  activeTemplateId,
  onApplyTemplate,
}: {
  templates: ChecklistTemplate[];
  activeTemplateId: string | null;
  onApplyTemplate: (template: ChecklistTemplate) => void;
}) {
  return (
    <Panel>
      <SectionTitle title="Templates prontos" description="Comece do zero ou aplique uma base pronta para acelerar o briefing." />
      <div className="divide-y divide-[var(--line)]">
        {templates.map((template) => (
          <div key={template.id} className="space-y-4 px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{template.name}</p>
                <p className="mt-1 text-sm muted">{template.projectType}</p>
              </div>
              <div className="flex items-center gap-2">
                {template.isDefault ? <StatusPill value="Padrão" /> : null}
                {activeTemplateId === template.id ? <StatusPill value="Em uso" /> : null}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] text-sm">
              <div className="bg-[var(--panel)] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] muted">Seções</p>
                <p className="mt-2 font-medium">{template.structure.sections.length}</p>
              </div>
              <div className="bg-[var(--panel)] px-3 py-3">
                <p className="text-xs uppercase tracking-[0.16em] muted">Itens</p>
                <p className="mt-2 font-medium">{template.structure.items.length}</p>
              </div>
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
