import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardProvider } from '@/components/providers/dashboard-provider';
import { getSession } from '@/lib/server/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardProvider session={session}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
