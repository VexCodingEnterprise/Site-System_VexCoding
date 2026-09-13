import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/shell';
import { DashboardProvider } from '@/components/providers/dashboard-provider';
import { getSession } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <DashboardProvider session={session}>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
