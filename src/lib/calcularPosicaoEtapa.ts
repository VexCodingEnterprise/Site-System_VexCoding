import type { ClientPortalStage } from '@/types/dashboard';

export function calcularPosicao(
  dataEtapa: Date,
  dataInicio: Date,
  dataFim: Date,
): number {
  const totalMs = dataFim.getTime() - dataInicio.getTime();

  if (totalMs <= 0) {
    return 0;
  }

  const etapaMs = dataEtapa.getTime() - dataInicio.getTime();
  return Math.min(Math.max((etapaMs / totalMs) * 100, 0), 100);
}

export function calcularProgressoLinha(
  etapas: ClientPortalStage[],
  hoje: Date,
  dataInicio: Date,
  dataFim: Date,
): number {
  const ordenadas = [...etapas].sort((a, b) => a.order - b.order);

  const ultimaConcluida = [...ordenadas]
    .filter((etapa) => etapa.status === 'concluida')
    .sort((a, b) => b.order - a.order)[0];

  const proximaPendente = ordenadas
    .filter((etapa) => etapa.status !== 'concluida')
    .sort((a, b) => a.order - b.order)[0];

  if (!ultimaConcluida) {
    return 0;
  }

  if (!proximaPendente) {
    return 100;
  }

  const posProxima = calcularPosicao(new Date(proximaPendente.dueDate), dataInicio, dataFim);
  const posHoje = calcularPosicao(hoje, dataInicio, dataFim);

  return Math.min(posHoje, posProxima);
}

export function getTimelineBounds(etapas: ClientPortalStage[], projectStart: string, projectEnd: string) {
  const initialDates = etapas.map((etapa) => new Date(etapa.dueDate).getTime()).filter((value) => Number.isFinite(value));
  const start = new Date(projectStart);
  const end = new Date(projectEnd);

  if (!initialDates.length) {
    return { start, end };
  }

  const minDate = new Date(Math.min(start.getTime(), ...initialDates));
  const maxDate = new Date(Math.max(end.getTime(), ...initialDates));

  return { start: minDate, end: maxDate };
}
