import { NextResponse } from 'next/server';
import { assertOfficialMode } from '@/lib/server/supabase-admin';

type ResolveClientResponse = {
  email?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: string };
    const identifier = body.identifier?.trim();

    if (!identifier) {
      return NextResponse.json<ResolveClientResponse>(
        { message: 'Informe o nome ou e-mail do cliente.' },
        { status: 400 },
      );
    }

    if (identifier.includes('@')) {
      return NextResponse.json<ResolveClientResponse>({ email: identifier.toLowerCase() });
    }

    const supabase = assertOfficialMode();
    const { data, error } = await supabase
      .from('clientes')
      .select('email')
      .ilike('nome', identifier)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json<ResolveClientResponse>({ message: error.message }, { status: 500 });
    }

    if (!data?.email) {
      return NextResponse.json<ResolveClientResponse>({ message: 'Cliente nao encontrado.' }, { status: 404 });
    }

    return NextResponse.json<ResolveClientResponse>({ email: String(data.email).toLowerCase() });
  } catch (error) {
    return NextResponse.json<ResolveClientResponse>(
      { message: error instanceof Error ? error.message : 'Nao foi possivel localizar o cliente.' },
      { status: 500 },
    );
  }
}
