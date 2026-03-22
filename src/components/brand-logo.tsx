'use client';

import { Code2 } from 'lucide-react';

export function BrandLogo({
  centered = false,
}: {
  centered?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${centered ? 'justify-center' : ''}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--text)] text-[var(--bg)]">
        <Code2 size={20} strokeWidth={2.4} />
      </div>
      <span className="text-xl font-bold tracking-tight text-[var(--text)]">VexCoding</span>
    </div>
  );
}
