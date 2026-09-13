'use client';

import { useMemo, useState } from 'react';
import { Panel, SectionTitle } from '@/components/dashboard/common';
import { useDashboard } from '@/components/providers/dashboard-provider';

export function SettingsView() {
  const { workspace, session, updatePreferences, changePassword } = useDashboard();
  const partner = useMemo(
    () => workspace?.partners.find((item) => item.id === session.partnerId),
    [workspace, session.partnerId],
  );

  const [password, setPassword] = useState('');
  if (!workspace || !partner) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
      <Panel>
        <SectionTitle title="Perfil do sócio" description="Preferências pessoais e notificações." />
        <div className="space-y-4 p-4">
          <label className="flex items-center justify-between gap-4 border border-[var(--line)] bg-[var(--panel-alt)] px-4 py-4">
            <span className="text-sm">Notificacoes por e-mail</span>
            <input
              type="checkbox"
              checked={partner.notificationsEmail}
              onChange={(event) => void updatePreferences({ notificationsEmail: event.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between gap-4 border border-[var(--line)] bg-[var(--panel-alt)] px-4 py-4">
            <span className="text-sm">Notificacoes no navegador</span>
            <input
              type="checkbox"
              checked={partner.notificationsBrowser}
              onChange={(event) => void updatePreferences({ notificationsBrowser: event.target.checked })}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Tema padrao</span>
            <select
              className="field"
              value={partner.themePreference}
              onChange={(event) => void updatePreferences({ themePreference: event.target.value as typeof partner.themePreference })}
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="system">Sistema</option>
            </select>
          </label>
        </div>
      </Panel>

      <Panel>
        <SectionTitle title="Alterar senha" description="No modo oficial, a senha é salva no Supabase." />
        <div className="space-y-4 p-4">
          <input className="field" type="password" placeholder="Nova senha" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button
            type="button"
            onClick={() => void changePassword(password)}
            className="h-11 w-full border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)]"
          >
            Atualizar senha
          </button>
        </div>
      </Panel>

    </div>
  );
}
