import type { ReactNode } from 'react';
import { ClienteDashboardShell } from '@/components/cliente/cliente-dashboard-shell';

export default function ClienteDashboardLayout({ children }: { children: ReactNode }) {
  return <ClienteDashboardShell>{children}</ClienteDashboardShell>;
}
