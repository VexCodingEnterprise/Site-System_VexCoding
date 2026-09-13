'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { ClienteHeader } from '@/components/cliente/ClienteHeader';
import { ClientePortalProvider, useClientePortal } from '@/components/cliente/cliente-portal-provider';

function ShellContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { clientName, logout, error } = useClientePortal();

  useEffect(() => {
    router.prefetch('/cliente/dashboard');
    router.prefetch('/cliente/dashboard/mensagens');
    router.prefetch('/cliente/dashboard/checklist');
    router.prefetch('/cliente/dashboard/documentos');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <ClienteHeader clientName={clientName} onLogout={logout} />
      <div className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-3 md:px-6">
          <Link href="/cliente/dashboard" className="border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium">
            Visão geral
          </Link>
          <Link href="/cliente/dashboard/mensagens" className="border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium">
            Mensagens
          </Link>
          <Link href="/cliente/dashboard/checklist" className="border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium">
            Checklist
          </Link>
          <Link href="/cliente/dashboard/documentos" className="border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium">
            Documentos
          </Link>
        </div>
      </div>
      {error ? <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:px-6">{error}</div> : null}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}

export function ClienteDashboardShell({ children }: { children: ReactNode }) {
  return (
    <ClientePortalProvider>
      <ShellContent>{children}</ShellContent>
    </ClientePortalProvider>
  );
}
