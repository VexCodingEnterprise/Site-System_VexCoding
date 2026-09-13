import { NextResponse } from 'next/server';
import { createId } from '@/lib/utils';
import { assertOfficialMode } from '@/lib/server/supabase-admin';
import { validatePublicLead } from '@/lib/server/validation';

const verifyTurnstile = async (token: string, remoteIp: string | null) => {
  const secret = (process.env.TURNSTILE_SECRET_KEY || '').trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (!secret) {
    return !isProduction && process.env.TURNSTILE_DEV_BYPASS === 'true';
  }

  if (!token) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    const result = (await response.json()) as { success?: boolean };
    return response.ok && result.success === true;
  } catch {
    return false;
  }
};

export async function POST(request: Request) {
  try {
    const body = validatePublicLead(await request.json());

    if (!body) {
      return NextResponse.json({ message: 'Revise os dados do formulário.' }, { status: 400 });
    }

    const turnstileValid = await verifyTurnstile(body.turnstileToken || '', request.headers.get('cf-connecting-ip'));
    if (!turnstileValid) {
      return NextResponse.json({ message: 'Não foi possível validar o envio. Tente novamente.' }, { status: 400 });
    }

    const supabase = assertOfficialMode();
    const { error } = await supabase.from('leads').insert({
      id: createId('lead'),
      nome: body.name,
      email: body.email,
      empresa: body.company,
      tipo_projeto: body.projectType,
      mensagem: body.message,
      status: 'Novo',
      criado_em: new Date().toISOString(),
      convertido_em: null,
      projeto_id: null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('public_lead_failed', error instanceof Error ? error.message : 'unknown_error');
    return NextResponse.json({ message: 'Não foi possível enviar o formulário agora.' }, { status: 500 });
  }
}
