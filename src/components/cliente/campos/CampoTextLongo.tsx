'use client';

import { useRef } from 'react';
import type { ChecklistItem } from '@/types/dashboard';

export function CampoTextLongo({
  item,
  value,
  onChange,
}: {
  item: ChecklistItem;
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className="space-y-2">
      <textarea
        ref={ref}
        className="field min-h-[120px] text-base"
        rows={5}
        value={value}
        placeholder={item.helpText || item.title}
        onChange={(event) => {
          onChange(event.target.value);
          event.currentTarget.style.height = 'auto';
          event.currentTarget.style.height = `${Math.max(event.currentTarget.scrollHeight, 120)}px`;
        }}
      />
      <div className="text-right text-xs muted">{value.length} caracteres</div>
    </div>
  );
}
