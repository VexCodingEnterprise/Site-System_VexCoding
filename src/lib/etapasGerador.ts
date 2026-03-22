import { createId } from '@/lib/utils';
import type {
  ChecklistResponse,
  Project,
  ProjectChecklist,
  StageTemplate,
  StageTemplateStep,
} from '@/types/dashboard';

const createStageTemplate = (
  name: string,
  projectType: string,
  steps: Array<[string, number, string | null]>,
): StageTemplate => ({
  id: createId('stage-template'),
  name,
  projectType,
  steps: steps.map(([stepName, daysFromStart, description], index) => ({
    id: createId('stage-template-step'),
    name: stepName,
    daysFromStart,
    description,
    order: index + 1,
  })),
  createdBy: 'vexcoding',
  createdAt: '2026-03-21T09:00:00.000Z',
  isDefault: true,
});

const addDaysToDate = (value: string, days: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const diffCalendarDays = (start: string, end: string) =>
  Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));

export const defaultStageTemplates: StageTemplate[] = [
  createStageTemplate('Site institucional - 30 dias', 'Site institucional', [
    ['Contrato assinado', 0, null],
    ['Briefing e checklist completos', 2, null],
    ['Wireframe entregue', 5, null],
    ['Layout no Figma', 10, null],
    ['Aprovacao do layout', 13, null],
    ['Desenvolvimento completo', 22, null],
    ['Revisao interna', 25, null],
    ['Apresentacao ao cliente', 27, null],
    ['Ajustes finais', 29, null],
    ['Deploy e entrega', 30, null],
  ]),
  createStageTemplate('Site institucional - 15 dias', 'Site institucional', [
    ['Contrato assinado', 0, null],
    ['Checklist completo', 1, null],
    ['Wireframe e layout', 4, null],
    ['Aprovacao', 6, null],
    ['Desenvolvimento', 11, null],
    ['Ajustes finais', 13, null],
    ['Deploy e entrega', 15, null],
  ]),
  createStageTemplate('Landing page - 7 dias', 'Landing Page', [
    ['Kickoff', 0, null],
    ['Briefing', 1, null],
    ['Layout', 3, null],
    ['Desenvolvimento', 5, null],
    ['Ajustes finais', 6, null],
    ['Publicacao', 7, null],
  ]),
  createStageTemplate('E-commerce simples - 45 dias', 'E-commerce', [
    ['Contrato assinado', 0, null],
    ['Checklist de conteudo', 3, null],
    ['Arquitetura de catalogo', 8, null],
    ['Layout no Figma', 15, null],
    ['Aprovacao do layout', 19, null],
    ['Cadastro inicial e desenvolvimento', 34, null],
    ['Revisao e testes', 40, null],
    ['Go-live', 45, null],
  ]),
  createStageTemplate('Sistema sob medida - 60 dias', 'Sistema interno', [
    ['Kickoff', 0, null],
    ['Escopo e checklist', 5, null],
    ['Arquitetura e fluxos', 12, null],
    ['Layout inicial', 20, null],
    ['Desenvolvimento fase 1', 35, null],
    ['Desenvolvimento fase 2', 48, null],
    ['Homologacao', 56, null],
    ['Entrega inicial', 60, null],
  ]),
];

const findResponseText = (
  checklist: ProjectChecklist | null,
  responses: ChecklistResponse[],
  includesTitle: string,
) => {
  if (!checklist) {
    return '';
  }

  const item = checklist.structure.items.find((entry) => entry.title.toLowerCase().includes(includesTitle.toLowerCase()));
  const response = item ? responses.find((entry) => entry.itemId === item.id) : null;
  return typeof response?.value === 'string' ? response.value : '';
};

const findBooleanResponse = (
  checklist: ProjectChecklist | null,
  responses: ChecklistResponse[],
  includesTitle: string,
) => {
  if (!checklist) {
    return false;
  }

  const item = checklist.structure.items.find((entry) => entry.title.toLowerCase().includes(includesTitle.toLowerCase()));
  const response = item ? responses.find((entry) => entry.itemId === item.id) : null;
  return typeof response?.value === 'boolean' ? response.value : false;
};

const pickBaseTemplate = (projectType: string) =>
  defaultStageTemplates.find((template) => projectType.toLowerCase().includes(template.projectType.toLowerCase())) ||
  defaultStageTemplates[0];

const applyComplexity = (
  project: Project,
  checklist: ProjectChecklist | null,
  responses: ChecklistResponse[],
  baseDuration: number,
) => {
  let extraDays = 0;

  if (project.type.toLowerCase().includes('e-commerce')) {
    const products = findResponseText(checklist, responses, 'Quantos produtos');
    if (products === '50-200') extraDays += 7;
    if (products === '200+') extraDays += 14;
  }

  if (project.type.toLowerCase().includes('sistema')) {
    if (findBooleanResponse(checklist, responses, 'Precisa de app mobile')) {
      extraDays += 12;
    }

    const users = findResponseText(checklist, responses, 'Quantos usuarios');
    if (users === '20-100') extraDays += 6;
    if (users === '100+') extraDays += 12;
  }

  return baseDuration + extraDays;
};

const scaleStepsToDuration = (steps: StageTemplateStep[], targetDuration: number) => {
  const baseDuration = Math.max(...steps.map((step) => step.daysFromStart), 1);
  const scale = targetDuration / baseDuration;

  return steps.map((step) => ({
    ...step,
    daysFromStart: Math.max(Math.round(step.daysFromStart * scale), step.order === 1 ? 0 : 1),
  }));
};

export const generateStagesFromChecklist = ({
  project,
  checklist,
  responses,
  startDate,
  desiredEndDate,
}: {
  project: Project;
  checklist: ProjectChecklist | null;
  responses: ChecklistResponse[];
  startDate: string;
  desiredEndDate?: string | null;
}) => {
  const template = pickBaseTemplate(project.type);
  const baseDuration = Math.max(...template.steps.map((step) => step.daysFromStart), 1);
  const desiredDuration =
    desiredEndDate && startDate
      ? Math.max(diffCalendarDays(startDate, desiredEndDate), 1)
      : null;
  const targetDuration = applyComplexity(project, checklist, responses, desiredDuration || baseDuration);
  const scaledSteps = scaleStepsToDuration(template.steps, targetDuration);

  return scaledSteps.map((step, index) => ({
    projectId: project.id,
    name: step.name,
    description: step.description,
    dueDate: addDaysToDate(startDate, step.daysFromStart),
    status: index === 0 ? 'em_andamento' : 'pendente',
    order: index + 1,
  }));
};
