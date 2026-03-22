'use client';

import type { ChecklistItem } from '@/types/dashboard';

const getInputType = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes('e-mail') || normalized.includes('email')) return 'email';
  if (normalized.includes('telefone') || normalized.includes('whatsapp')) return 'tel';
  if (normalized.includes('url') || normalized.includes('link') || normalized.includes('site')) return 'url';
  return 'text';
};

export function CampoTexto({
  item,
  value,
  onChange,
}: {
  item: ChecklistItem;
  value: string;
  onChange: (value: string) => void;
}) {
  const type = getInputType(item.title);

  return (
    <input
      className="field h-12 text-base"
      type={type}
      inputMode={type === 'email' ? 'email' : type === 'tel' ? 'tel' : type === 'url' ? 'url' : 'text'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={item.helpText || item.title}
    />
  );
}
