'use client';

import { BarraProgresso } from '@/components/cliente/BarraProgresso';
import type { ClientPortalStage } from '@/types/dashboard';

export function PreviewBarra({
  stages,
  projectStart,
  projectEnd,
}: {
  stages: ClientPortalStage[];
  projectStart: string;
  projectEnd: string;
}) {
  return <BarraProgresso stages={stages} projectStart={projectStart} projectEnd={projectEnd} compact />;
}
