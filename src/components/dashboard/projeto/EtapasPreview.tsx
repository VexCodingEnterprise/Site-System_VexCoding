'use client';

import { BarraProgresso } from '@/components/cliente/BarraProgresso';
import { Panel, SectionTitle } from '@/components/dashboard/common';
import type { ClientPortalStage } from '@/types/dashboard';

export function EtapasPreview({
  stages,
  projectStart,
  projectEnd,
}: {
  stages: ClientPortalStage[];
  projectStart: string;
  projectEnd: string;
}) {
  return (
    <Panel>
      <SectionTitle title="Preview da barra" description="Miniatura em tempo real do que o cliente vai enxergar no portal." />
      <div className="p-4">
        <BarraProgresso stages={stages} projectStart={projectStart} projectEnd={projectEnd} compact />
      </div>
    </Panel>
  );
}
