'use client';

import { isChecklistValueFilled } from '@/lib/checklist';
import type { ChecklistResponseValue, ProjectChecklist } from '@/types/dashboard';

const renderValue = (value: ChecklistResponseValue) => {
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }

  if (typeof value === 'string') {
    return value || 'Não preenchido';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Não preenchido';
    }

    return value
      .map((entry) => (typeof entry === 'string' ? entry : entry.name))
      .join(', ');
  }

  if (value && typeof value === 'object' && 'name' in value) {
    return value.name;
  }

  return 'Não preenchido';
};

export function ChecklistRevisao({
  checklist,
  responses,
  onEditSection,
  onSubmit,
  submitting,
}: {
  checklist: ProjectChecklist;
  responses: Record<string, ChecklistResponseValue>;
  onEditSection: (sectionIndex: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const sections = [...checklist.structure.sections].sort((first, second) => first.order - second.order);
  const missingRequired = checklist.structure.items.filter(
    (item) => item.required && !isChecklistValueFilled(responses[item.id] ?? null),
  );

  return (
    <div className="space-y-4">
      {missingRequired.length > 0 ? (
        <div className="border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          Faltam {missingRequired.length} itens obrigatorios para enviar o checklist.
        </div>
      ) : null}

      {sections.map((section, sectionIndex) => {
        const items = checklist.structure.items
          .filter((item) => item.sectionId === section.id)
          .sort((first, second) => first.order - second.order);

        return (
          <div key={section.id} className="border border-[var(--line)] bg-[var(--panel)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-4">
              <div>
                <h3 className="text-base font-semibold text-[var(--text)]">{section.title}</h3>
                {section.description ? <p className="mt-1 text-sm muted">{section.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => onEditSection(sectionIndex)}
                className="h-11 border border-[var(--line)] bg-[var(--panel-alt)] px-4 text-sm font-medium"
              >
                Editar secao
              </button>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {items.map((item) => {
                const value = responses[item.id] ?? null;
                const missing = item.required && !isChecklistValueFilled(value);
                return (
                  <div key={item.id} className="px-4 py-4">
                    <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
                    <p className={`mt-2 text-sm ${missing ? 'text-red-600' : 'muted'}`}>{renderValue(value)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        disabled={submitting || missingRequired.length > 0}
        onClick={onSubmit}
        className="h-14 w-full border border-[var(--text)] bg-[var(--text)] text-base font-medium text-[var(--bg)] disabled:opacity-50"
      >
        {submitting ? 'Enviando checklist...' : 'Enviar checklist'}
      </button>
    </div>
  );
}
