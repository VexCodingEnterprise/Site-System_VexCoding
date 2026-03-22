'use client';

import { Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandLogo({
  centered = false,
  iconOnly = false,
  iconSize = 'md',
  className = '',
  textClassName = '',
}: {
  centered?: boolean;
  iconOnly?: boolean;
  iconSize?: 'sm' | 'md';
  className?: string;
  textClassName?: string;
}) {
  const iconBoxClassName = iconSize === 'sm' ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-lg';
  const iconClassSize = iconSize === 'sm' ? 18 : 20;

  return (
    <div className={cn('flex items-center gap-2', centered && 'justify-center', className)}>
      <div className={cn('flex items-center justify-center bg-[var(--text)] text-[var(--bg)]', iconBoxClassName)}>
        <Code2 size={iconClassSize} strokeWidth={2.4} />
      </div>
      {!iconOnly ? (
        <span className={cn('text-xl font-bold tracking-tight text-[var(--text)]', textClassName)}>VexCoding</span>
      ) : null}
    </div>
  );
}
