'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { leadStatusOptions } from '@/data/demo';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { formatDateTime } from '@/lib/utils';

export function LeadsView() {
  const { workspace, actionLoading, updateLeadStatus, convertLeadToProject } = useDashboard();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | (typeof leadStatusOptions)[number]>('Todos');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const selectedLead = workspace?.leads.find((lead) => lead.id === selectedLeadId) || null;

  const filteredLeads = useMemo(() => {
    if (!workspace) return [];
    return workspace.leads.filter((lead) => {
      const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workspace, search, statusFilter]);

  if (!workspace) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Panel>
        <SectionTitle title="Leads recebidos" description="Contatos vindos do formulario publico do site." />
        <div className="grid grid-cols-1 gap-4 border-b border-[var(--line)] p-4 md:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 border border-[var(--line)] bg-[var(--panel)] px-3">
            <Search size={16} className="text-[var(--muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 flex-1 border-0 bg-transparent outline-none"
              placeholder="Buscar por nome"
            />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="field h-11">
            <option>Todos</option>
            {leadStatusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Mensagem</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-[var(--line)]">
                  <td className="px-4 py-4 font-medium">{lead.name}</td>
                  <td className="px-4 py-4 muted">{lead.email}</td>
                  <td className="px-4 py-4">{lead.projectType}</td>
                  <td className="max-w-[320px] px-4 py-4 muted">{lead.message.slice(0, 72)}...</td>
                  <td className="px-4 py-4">
                    <StatusPill value={lead.status} />
                  </td>
                  <td className="px-4 py-4 text-xs muted">{formatDateTime(lead.createdAt)}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="border border-[var(--line)] px-3 py-2 text-xs font-medium"
                    >
                      Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <AnimatePresence>
        {selectedLead ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLeadId(null)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto border-l border-[var(--line)] bg-[var(--panel)]"
            >
              <div className="sticky top-0 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--panel)] px-4">
                <div>
                  <p className="text-sm font-semibold">{selectedLead.name}</p>
                  <p className="text-xs muted">{selectedLead.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLeadId(null)}
                  className="flex h-10 w-10 items-center justify-center border border-[var(--line)]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5 p-4">
                <div className="panel-alt px-4 py-4">
                  <p className="text-sm font-medium">Tipo de projeto</p>
                  <p className="mt-2 muted">{selectedLead.projectType}</p>
                </div>
                <div className="panel-alt px-4 py-4">
                  <p className="text-sm font-medium">Mensagem completa</p>
                  <p className="mt-2 whitespace-pre-wrap leading-7 muted">{selectedLead.message}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Status</span>
                    <select
                      className="field"
                      value={selectedLead.status}
                      onChange={(event) => void updateLeadStatus(selectedLead.id, event.target.value as typeof selectedLead.status)}
                    >
                      {leadStatusOptions.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Data</span>
                    <div className="panel-alt px-4 py-3 text-sm muted">{formatDateTime(selectedLead.createdAt)}</div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={actionLoading || selectedLead.status === 'Convertido'}
                  onClick={() =>
                    void convertLeadToProject(selectedLead.id, {
                      name: selectedLead.projectType === 'Landing Page' ? `Site ${selectedLead.name}` : `Projeto ${selectedLead.name}`,
                      clientName: selectedLead.name,
                      clientEmail: selectedLead.email,
                      company: selectedLead.name,
                      type: selectedLead.projectType,
                      description: selectedLead.message,
                      valueTotal: 18000,
                      valueReceived: 9000,
                      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().slice(0, 10),
                      status: 'Briefing',
                      partnerIds: ['rafael', 'lourenzo'],
                    })
                  }
                  className="h-11 w-full border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedLead.status === 'Convertido' ? 'Lead ja convertido' : 'Converter em projeto'}
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
