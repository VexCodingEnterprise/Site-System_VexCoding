'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { formatCurrency, monthKey, percentageChange, sumBy } from '@/lib/utils';

const colors = ['#0A0A0A', '#444444', '#7A7A7A', '#A1A1A1'];

export function FinanceView() {
  const { workspace } = useDashboard();
  const [monthFilter, setMonthFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const summary = useMemo(() => {
    if (!workspace) return null;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const previous = new Date();
    previous.setMonth(previous.getMonth() - 1);
    const previousMonth = previous.toISOString().slice(0, 7);

    const receivedCurrent = sumBy(
      workspace.finance.filter((entry) => entry.status === 'Recebido' && monthKey(entry.date) === currentMonth),
      (entry) => entry.value,
    );
    const receivedPrevious = sumBy(
      workspace.finance.filter((entry) => entry.status === 'Recebido' && monthKey(entry.date) === previousMonth),
      (entry) => entry.value,
    );
    const pending = sumBy(
      workspace.finance.filter((entry) => entry.status === 'Pendente'),
      (entry) => entry.value,
    );

    return {
      receivedCurrent,
      pending,
      split: receivedCurrent / 3,
      variation: percentageChange(receivedCurrent, receivedPrevious),
    };
  }, [workspace]);

  if (!workspace || !summary) {
    return null;
  }

  const monthlyRevenue = Object.entries(
    workspace.finance.reduce<Record<string, number>>((acc, entry) => {
      if (entry.status !== 'Recebido') return acc;
      const key = monthKey(entry.date);
      acc[key] = (acc[key] || 0) + entry.value;
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, total]) => ({ month, total }));

  const revenueByType = workspace.projects.map((project) => ({
    type: project.type,
    total: workspace.finance
      .filter((entry) => entry.projectId === project.id && entry.status === 'Recebido')
      .reduce((sum, entry) => sum + entry.value, 0),
  }));

  const receiptStatus = [
    { name: 'Recebido', value: workspace.finance.filter((entry) => entry.status === 'Recebido').length },
    { name: 'Pendente', value: workspace.finance.filter((entry) => entry.status === 'Pendente').length },
  ];

  const months = ['Todos', ...new Set(workspace.finance.map((entry) => monthKey(entry.date)))];
  const filteredRows = workspace.finance.filter((entry) => {
    const matchMonth = monthFilter === 'Todos' || monthKey(entry.date) === monthFilter;
    const matchStatus = statusFilter === 'Todos' || entry.status === statusFilter;
    return matchMonth && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {[
          { label: 'Total recebido no mes', value: formatCurrency(summary.receivedCurrent) },
          { label: 'Total a receber', value: formatCurrency(summary.pending) },
          { label: 'Divisao por socio', value: formatCurrency(summary.split) },
          { label: 'Comparacao com mes anterior', value: `${summary.variation.toFixed(1)}%` },
        ].map((card) => (
          <Panel key={card.label} className="px-4 py-4">
            <p className="text-sm muted">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold">{card.value}</p>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel>
          <SectionTitle title="Receita mensal" description="Ultimos 12 meses" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip />
                <Area dataKey="total" stroke="#0A0A0A" fill="#0A0A0A" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Receita por tipo" description="Valor recebido por projeto" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByType}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="type" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip />
                <Bar dataKey="total" fill="#0A0A0A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Status de recebimento" description="Visao de caixa" />
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={receiptStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={92}>
                  {receiptStatus.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionTitle title="Historico de transacoes" description="Filtre por mes e status." />
        <div className="grid grid-cols-1 gap-4 border-b border-[var(--line)] p-4 md:grid-cols-2">
          <select className="field" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
            {months.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>
          <select className="field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>Todos</option>
            <option>Recebido</option>
            <option>Pendente</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.16em] muted">
                <th className="px-4 py-3">Projeto</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((entry) => {
                const project = workspace.projects.find((item) => item.id === entry.projectId);
                return (
                  <tr key={entry.id} className="border-b border-[var(--line)]">
                    <td className="px-4 py-4 font-medium">{project?.name}</td>
                    <td className="px-4 py-4 muted">{project?.clientName}</td>
                    <td className="px-4 py-4">{formatCurrency(entry.value)}</td>
                    <td className="px-4 py-4">{entry.type}</td>
                    <td className="px-4 py-4">{entry.date}</td>
                    <td className="px-4 py-4">
                      <StatusPill value={entry.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
