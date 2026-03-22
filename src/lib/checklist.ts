import { createId } from '@/lib/utils';
import type {
  ChecklistFieldType,
  ChecklistItem,
  ChecklistResponse,
  ChecklistResponseValue,
  ChecklistSection,
  ChecklistStructure,
  ChecklistTemplate,
  ProjectChecklist,
} from '@/types/dashboard';

const createSection = (title: string, order: number, description?: string | null): ChecklistSection => ({
  id: createId('checklist-section'),
  title,
  description: description || null,
  order,
  collapsed: false,
});

const createItem = (
  sectionId: string,
  order: number,
  title: string,
  type: ChecklistFieldType,
  required = false,
  helpText: string | null = null,
  options: string[] = [],
  acceptedFormats: string[] = [],
  maxFiles: number | null = null,
): ChecklistItem => ({
  id: createId('checklist-item'),
  sectionId,
  title,
  type,
  required,
  helpText,
  order,
  maxFiles,
  acceptedFormats,
  options: options.map((label) => ({ id: createId('checklist-option'), label })),
});

const createTemplate = (
  name: string,
  projectType: string,
  structure: ChecklistStructure,
  isDefault = true,
): ChecklistTemplate => ({
  id: createId('checklist-template'),
  name,
  projectType,
  structure,
  createdBy: 'vexcoding',
  createdAt: '2026-03-21T09:00:00.000Z',
  isDefault,
});

const buildSiteTemplate = () => {
  const identidade = createSection('Identidade Visual', 1);
  const conteudo = createSection('Conteudo', 2);
  const referencias = createSection('Referencias', 3);
  const tecnico = createSection('Acessos e Tecnico', 4);

  return createTemplate('Site institucional', 'Site institucional', {
    sections: [identidade, conteudo, referencias, tecnico],
    items: [
      createItem(identidade.id, 1, 'Logo da empresa', 'file', true, 'Envie em PNG ou SVG, fundo transparente', [], ['image/png', 'image/svg+xml', 'application/pdf'], 1),
      createItem(identidade.id, 2, 'Cores da marca', 'color', true, 'Voce pode informar ate 3 cores manualmente ao longo do preenchimento'),
      createItem(identidade.id, 3, 'Fontes preferidas', 'text', false),
      createItem(identidade.id, 4, 'Estilo visual', 'single_choice', true, null, ['Moderno', 'Classico', 'Minimalista', 'Arrojado']),
      createItem(conteudo.id, 1, 'Nome da empresa', 'text', true),
      createItem(conteudo.id, 2, 'Slogan ou frase principal', 'text', false),
      createItem(conteudo.id, 3, 'Sobre a empresa', 'textarea', true),
      createItem(conteudo.id, 4, 'Servicos ou produtos', 'textarea', true),
      createItem(conteudo.id, 5, 'Fotos da empresa/equipe', 'image_gallery', false, null, [], ['image/png', 'image/jpeg', 'image/webp'], 12),
      createItem(referencias.id, 1, 'Sites que gosta', 'link', false, 'Voce pode enviar ate 3 referencias'),
      createItem(referencias.id, 2, 'Sites que nao gosta', 'link', false),
      createItem(referencias.id, 3, 'Observacoes gerais', 'textarea', false),
      createItem(tecnico.id, 1, 'Ja tem dominio?', 'boolean', true),
      createItem(tecnico.id, 2, 'Se sim, qual dominio?', 'text', false),
      createItem(tecnico.id, 3, 'Ja tem hospedagem?', 'boolean', true),
      createItem(tecnico.id, 4, 'E-mail de contato do site', 'text', true),
      createItem(tecnico.id, 5, 'Telefone/WhatsApp para o site', 'text', true),
      createItem(tecnico.id, 6, 'Redes sociais', 'link', false),
    ],
  });
};

const buildEcommerceTemplate = () => {
  const base = buildSiteTemplate();
  const loja = createSection('Loja', 5);

  return {
    ...base,
    id: createId('checklist-template'),
    name: 'E-commerce',
    projectType: 'E-commerce',
    structure: {
      sections: [...base.structure.sections, loja],
      items: [
        ...base.structure.items,
        createItem(loja.id, 1, 'Quantos produtos aproximadamente?', 'single_choice', true, null, ['1-10', '10-50', '50-200', '200+']),
        createItem(loja.id, 2, 'Tem fotos dos produtos?', 'boolean', true),
        createItem(loja.id, 3, 'Se sim, envie as fotos', 'image_gallery', false, null, [], ['image/png', 'image/jpeg', 'image/webp'], 30),
        createItem(loja.id, 4, 'Forma de pagamento desejada', 'multi_choice', true, null, ['Cartao', 'PIX', 'Boleto', 'Todos']),
        createItem(loja.id, 5, 'Vai fazer entregas?', 'boolean', true),
        createItem(loja.id, 6, 'Regioes de entrega', 'text', false),
      ],
    },
  };
};

const buildCustomSystemTemplate = () => {
  const sistema = createSection('Sobre o Sistema', 1);
  const funcionalidades = createSection('Funcionalidades', 2);

  return createTemplate('Sistema sob medida', 'Sistema interno', {
    sections: [sistema, funcionalidades],
    items: [
      createItem(sistema.id, 1, 'Descreva o sistema que precisa', 'textarea', true),
      createItem(sistema.id, 2, 'Quem vai usar o sistema?', 'text', false),
      createItem(sistema.id, 3, 'Quantos usuarios aproximadamente?', 'single_choice', true, null, ['1-5', '5-20', '20-100', '100+']),
      createItem(sistema.id, 4, 'Precisa de app mobile?', 'boolean', true),
      createItem(sistema.id, 5, 'Tem algum sistema similar de referencia?', 'link', false),
      createItem(funcionalidades.id, 1, 'Liste as funcionalidades principais', 'textarea', true),
      createItem(funcionalidades.id, 2, 'O que e mais urgente?', 'textarea', true),
      createItem(funcionalidades.id, 3, 'Tem integracoes necessarias?', 'multi_choice', false, null, ['WhatsApp', 'Pagamentos', 'E-mail', 'Outros']),
    ],
  });
};

export const defaultChecklistTemplates: ChecklistTemplate[] = [
  buildSiteTemplate(),
  buildEcommerceTemplate(),
  buildCustomSystemTemplate(),
];

export const createBlankChecklistStructure = (): ChecklistStructure => {
  const section = createSection('Nova secao', 1);
  return {
    sections: [section],
    items: [],
  };
};

export const cloneChecklistStructure = (structure: ChecklistStructure): ChecklistStructure =>
  JSON.parse(JSON.stringify(structure)) as ChecklistStructure;

export const createChecklistFromTemplate = (
  projectId: string,
  template: ChecklistTemplate | null,
): ProjectChecklist => ({
  id: createId('project-checklist'),
  projectId,
  templateId: template?.id || null,
  structure: template ? cloneChecklistStructure(template.structure) : createBlankChecklistStructure(),
  status: 'rascunho',
  releasedAt: null,
  submittedAt: null,
  createdAt: new Date().toISOString(),
  reopenedAt: null,
  lastSavedAt: null,
});

export const getChecklistTemplateForProjectType = (projectType: string) =>
  defaultChecklistTemplates.find((template) => projectType.toLowerCase().includes(template.projectType.toLowerCase())) ||
  defaultChecklistTemplates.find((template) => template.projectType === 'Sistema interno') ||
  defaultChecklistTemplates[0];

export const isChecklistValueFilled = (value: ChecklistResponseValue) => {
  if (typeof value === 'boolean') {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (value && typeof value === 'object') {
    return true;
  }

  return false;
};

export const calculateChecklistProgress = (
  checklist: ProjectChecklist | null,
  responses: ChecklistResponse[],
) => {
  if (!checklist) {
    return {
      percentage: 0,
      requiredAnswered: 0,
      requiredTotal: 0,
      answeredCount: 0,
      totalItems: 0,
    };
  }

  const items = checklist.structure.items;
  const answeredItems = items.filter((item) => {
    const response = responses.find((entry) => entry.itemId === item.id);
    return response ? isChecklistValueFilled(response.value) : false;
  });
  const requiredItems = items.filter((item) => item.required);
  const requiredAnswered = requiredItems.filter((item) => {
    const response = responses.find((entry) => entry.itemId === item.id);
    return response ? isChecklistValueFilled(response.value) : false;
  });

  return {
    percentage: items.length ? Math.round((answeredItems.length / items.length) * 100) : 0,
    requiredAnswered: requiredAnswered.length,
    requiredTotal: requiredItems.length,
    answeredCount: answeredItems.length,
    totalItems: items.length,
  };
};

export const getChecklistSectionProgress = (
  checklist: ProjectChecklist,
  responses: ChecklistResponse[],
  sectionId: string,
) => {
  const items = checklist.structure.items.filter((item) => item.sectionId === sectionId);
  const answered = items.filter((item) => {
    const response = responses.find((entry) => entry.itemId === item.id);
    return response ? isChecklistValueFilled(response.value) : false;
  });

  return {
    total: items.length,
    answered: answered.length,
    percentage: items.length ? Math.round((answered.length / items.length) * 100) : 0,
  };
};
