import { NextResponse } from 'next/server';
import { createId } from '@/lib/utils';
import { assertOfficialMode } from '@/lib/server/supabase-admin';
import type { PublicLeadPayload } from '@/types/dashboard';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublicLeadPayload;

    if (!body.name || !body.email || !body.projectType || !body.message) {
      return NextResponse.json({ message: 'Preencha todos os campos.' }, { status: 400 });
    }

    const supabase = assertOfficialMode();
    const { error } = await supabase.from('leads').insert({
      id: createId('lead'),
      nome: body.name,
      email: body.email,
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
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Nao foi possivel enviar o lead.' },
      { status: 500 },
    );
  }
}
