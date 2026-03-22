'use client';

import { useMemo, useState } from 'react';
import { Panel, SectionTitle, StatusPill } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';

export function CriarAcessoCliente({ projectId }: { projectId: string }) {
  const { workspace, createClientAccess, regenerateClientPassword } = useDashboard();
  const client = useMemo(
    () => workspace?.clients.find((item) => item.projectId === projectId) || null,
    [workspace?.clients, projectId],
  );
  const [form, setForm] = useState({
    name: client?.name || '',
    email: client?.email || '',
  });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  return (
    <Panel>
      <SectionTitle title="Criar acesso do cliente" description="A conta do cliente e criada pelos socios e a senha aparece uma unica vez." />
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Status do acesso</p>
            <p className="mt-1 text-sm muted">
              {client ? `Conta vinculada a ${client.email}` : 'Nenhum acesso criado para este projeto.'}
            </p>
          </div>
          <StatusPill value={client?.accessStatus || 'Aguardando criacao'} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            className="field"
            placeholder="Nome completo"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="field"
            placeholder="cliente@empresa.com"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            disabled={!form.name || !form.email}
            onClick={async () => {
              const payload = await createClientAccess(projectId, form.name, form.email);
              setGeneratedPassword(payload.temporaryPassword);
            }}
            className="h-11 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {client ? 'Atualizar acesso' : 'Criar acesso'}
          </button>

          {client ? (
            <button
              type="button"
              onClick={async () => {
                const payload = await regenerateClientPassword(client.id);
                setGeneratedPassword(payload.temporaryPassword);
              }}
              className="h-11 border border-[var(--line)] bg-[var(--panel)] px-4 text-sm font-medium"
            >
              Regenerar senha
            </button>
          ) : null}
        </div>

        {generatedPassword ? (
          <div className="border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            <p className="font-semibold">Senha temporaria gerada</p>
            <p className="mt-2 font-mono">{generatedPassword}</p>
            <p className="mt-2 text-xs">
              Copie agora e envie ao cliente manualmente por WhatsApp.
            </p>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
