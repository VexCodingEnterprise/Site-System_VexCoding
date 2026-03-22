'use client';

import type { ChecklistItem } from '@/types/dashboard';

export function CampoEscolhaUnica({
  item,
  value,
  onChange,
}: {
  item: ChecklistItem;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {item.options.map((option) => {
        const selected = value === option.label;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.label)}
            className={`w-full border px-4 py-4 text-left text-base ${
              selected
                ? 'border-[var(--text)] bg-[var(--panel-alt)] text-[var(--text)]'
                : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
