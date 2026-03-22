'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';

export function ClienteHeader({
  clientName,
  onLogout,
}: {
  clientName: string;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--panel)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-[var(--text)] text-[var(--bg)]">
            VC
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">VexCoding</p>
            <p className="text-xs muted">Portal do cliente</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <p className="hidden text-sm muted md:block">Ola, {clientName}</p>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex h-10 items-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-medium text-[var(--text)]"
          >
            <LogOut size={15} />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
