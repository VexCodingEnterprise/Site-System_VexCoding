import type { PublicLeadPayload } from '@/types/dashboard';

const allowedProjectTypes = new Set([
  'Landing Page',
  'Site institucional',
  'Site / Landing Page',
  'Sistema interno',
  'SaaS',
  'Sistema sob medida / SaaS',
  'Design / UI UX',
  'E-commerce',
  'Automacao',
  'Automacao interna',
  'Automação',
  'Automação interna',
  'Outro',
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const validatePublicLead = (input: unknown): PublicLeadPayload | null => {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const body = input as Record<string, unknown>;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  const projectType = typeof body.projectType === 'string' ? body.projectType.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken.trim() : '';

  if (name.length < 2 || name.length > 120) return null;
  if (email.length > 254 || !emailPattern.test(email)) return null;
  if (company.length > 160) return null;
  if (!allowedProjectTypes.has(projectType) || projectType.length > 80) return null;
  if (message.length < 10 || message.length > 4000) return null;

  return { name, email, company, projectType, message, turnstileToken };
};

export const isValidUpload = (file: File, options?: { maxBytes?: number }) => {
  const maxBytes = options?.maxBytes || 10 * 1024 * 1024;
  const allowedTypes = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/zip',
  ]);

  return (
    file.size > 0 &&
    file.size <= maxBytes &&
    file.name.length <= 180 &&
    allowedTypes.has(file.type)
  );
};

export const validatePasswordInput = (value: unknown) =>
  typeof value === 'string' && value.trim().length >= 12 && value.length <= 128;
