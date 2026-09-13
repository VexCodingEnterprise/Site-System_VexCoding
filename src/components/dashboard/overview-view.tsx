'use client';

import Link from 'next/link';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight } from 'lucide-react';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { formatCurrency, formatDateTime, groupBy, monthKey, sumBy } from '@/lib/utils';

const monochrome = ['#0A0A0A', '#2E2E2E', '#555555', '#7A7A7A'];

export function OverviewView() {
  const { workspace } = useDashboard();

  if (!workspace) {
    return null;
  }

  const openTasks = workspace.tasks.filter((task) => task.status !== 'Concluido');
  const activeProjects = workspace.projects.filter((project) => project.status !== 'Concluido');
  const newLeads = workspace.leads.filter((lead) => lead.status === 'Novo');

  const monthlyRevenueMap = workspace.finance.reduce<Record<string, number>>((acc, entry) => {
    if (entry.status !== 'Recebido') return acc;
    const key = monthKey(entry.date);
    acc[key] = (acc[key] || 0) + entry.value;
    return acc;
  }, {});

  const monthlyRevenue = Object.entries(monthlyRevenueMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, value]) => ({ month: key, receita: value }));

  const projectsByStatus = Object.entries(groupBy(activeProjects, (project) => project.status)).map(([status, items]) => ({
    status,
    total: items.length,
  }));

  const tasksByAssignee = workspace.partners.map((partner) => ({
    name: partner.displayName.split(' ')[0],
    total: workspace.tasks.filter((task) => task.assigneeId === partner.id).length,
  }));

  const taskMap = ['Backlog', 'Em andamento', 'Bloqueado', 'Concluido'].map((status) => ({
    status,
    total: workspace.tasks.filter((task) => task.status === status).length,
  }));

  const currentMonth = new Date().toISOString().slice(0, 7);
  const previousMonthDate = new Date();
  previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
  const previousMonth = previousMonthDate.toISOString().slice(0, 7);

  const currentMonthRevenue = sumBy(
    workspace.finance.filter((entry) => entry.status === 'Recebido' && monthKey(entry.date) === currentMonth),
    (entry) => entry.value,
  );
  const splitPerPartner = currentMonthRevenue / workspace.partners.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {[
          { label: 'Leads novos', value: newLeads.length, helper: 'Aguardando qualificação' },
          { label: 'Projetos ativos', value: activeProjects.length, helper: 'Briefing, execução ou aprovação' },
          { label: 'Tarefas abertas', value: openTasks.length, helper: 'Backlog, andamento ou bloqueadas' },
          {
            label: 'Lucro atual',
            value: formatCurrency(currentMonthRevenue),
            helper: `Divisão por sócio: ${formatCurrency(splitPerPartner)}`,
          },
        ].map((card) => (
          <Panel key={card.label} className="px-4 py-4">
            <p className="text-sm muted">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm muted">{card.helper}</p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel>
          <SectionTitle title="Receita mensal" description="Últimos 6 meses" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip />
                <Line type="monotone" dataKey="receita" stroke="#0A0A0A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <SectionTitle title="Projetos por status" description="Carteira ativa" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectsByStatus}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="status" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#0A0A0A" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <SectionTitle title="Tarefas por sócio" description="Distribuição atual" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tasksByAssignee} dataKey="total" nameKey="name" innerRadius={62} outerRadius={92}>
                  {tasksByAssignee.map((entry, index) => (
                    <Cell key={entry.name} fill={monochrome[index % monochrome.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <SectionTitle
            title="Leads recentes"
            description="Últimos 5 contatos"
            action={
              <Link href="/dashboard/leads" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                Ir para leads <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="divide-y divide-[var(--line)]">
            {workspace.leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm muted">{lead.projectType}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill value={lead.status} />
                  <span className="text-xs muted">{formatDateTime(lead.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionTitle
            title="Mapa de tarefas"
            description="Kanban resumido"
            action={
              <Link href="/dashboard/tarefas" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text)]">
                Ver execução <ArrowRight size={16} />
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-px bg-[var(--line)] md:grid-cols-4">
            {taskMap.map((column) => (
              <div key={column.status} className="bg-[var(--panel)] px-4 py-5">
                <StatusPill value={column.status} />
                <p className="mt-4 text-4xl font-semibold">{column.total}</p>
                <p className="mt-1 text-sm muted">{column.status}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
