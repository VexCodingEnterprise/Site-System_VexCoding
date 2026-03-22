import { branchStatuses, financeKinds, serviceTypes, taskStatuses, teamRoles } from '../data/mockData';

export const createProjectForm = () => ({
  name: '',
  client_name: '',
  client_email: '',
  company: '',
  service_type: serviceTypes[0],
  summary: '',
  due_date: '',
  budget_total: '',
  owner_id: '',
  priority: 'Media',
  status: 'Briefing',
  completion: 5,
  client_notes: '',
});

export const createProjectDraftFromLead = (lead) => ({
  name: lead?.company || `Projeto ${lead?.name || ''}`.trim(),
  summary: lead?.message || '',
  due_date: '',
  budget_total: '',
  owner_id: '',
  priority: 'Media',
  status: 'Briefing',
});

export const createBranchForm = () => ({
  name: '',
  owner_id: '',
  status: branchStatuses[0],
  due_date: '',
  summary: '',
});

export const createTaskForm = () => ({
  title: '',
  branch_id: '',
  assignee_id: '',
  status: taskStatuses[0],
  priority: 'Media',
  estimated_hours: '',
  due_date: '',
});

export const createFinanceForm = () => ({
  project_id: '',
  kind: financeKinds[0],
  title: '',
  amount: '',
  category: '',
  entry_date: new Date().toISOString().slice(0, 10),
  notes: '',
});

export const createTeamForm = () => ({
  full_name: '',
  email: '',
  role: teamRoles[0],
  specialty: '',
  is_partner: false,
  workload_capacity: 40,
});

export const createDocumentForm = () => ({
  title: '',
  type: 'Documento',
  externalUrl: '',
  file: null,
});
