import { describe, expect, it } from 'vitest';
import { isValidUpload, validatePasswordInput, validatePublicLead } from '../src/lib/server/validation';

describe('validação de leads públicos', () => {
  it('normaliza e aceita um lead válido', () => {
    const result = validatePublicLead({
      name: '  Maria Silva  ',
      email: 'MARIA@EXEMPLO.COM',
      projectType: 'Site / Landing Page',
      message: 'Preciso de uma página comercial para captar novos contatos.',
      turnstileToken: 'token',
    });

    expect(result).toEqual({
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      company: '',
      projectType: 'Site / Landing Page',
      message: 'Preciso de uma página comercial para captar novos contatos.',
      turnstileToken: 'token',
    });
  });

  it('rejeita campos obrigatórios inválidos', () => {
    expect(
      validatePublicLead({
        name: 'A',
        email: 'invalido',
        projectType: 'Tipo inventado',
        message: 'curto',
      }),
    ).toBeNull();
  });
});

describe('validação de uploads', () => {
  it('aceita PDF dentro do limite e rejeita tipo não permitido', () => {
    const validFile = new File([new Uint8Array(128)], 'briefing.pdf', { type: 'application/pdf' });
    const invalidFile = new File([new Uint8Array(128)], 'script.exe', { type: 'application/x-msdownload' });

    expect(isValidUpload(validFile)).toBe(true);
    expect(isValidUpload(invalidFile)).toBe(false);
  });
});

describe('senha', () => {
  it('exige no mínimo 12 caracteres', () => {
    expect(validatePasswordInput('curta')).toBe(false);
    expect(validatePasswordInput('uma-senha-com-12')).toBe(true);
  });
});
