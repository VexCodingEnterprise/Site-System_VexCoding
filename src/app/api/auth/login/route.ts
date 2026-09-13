import { NextResponse } from 'next/server';
import { signInPartner } from '@/lib/server/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim().toLowerCase();
    const password = body.password || '';

    if (!username || !password) {
      return NextResponse.json({ message: 'Usuário e senha são obrigatórios.' }, { status: 400 });
    }

    const partner = await signInPartner(username, password);

    if (!partner) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    return NextResponse.json({
      session: {
        partnerId: partner.partnerId,
        username: partner.username,
        displayName: partner.displayName,
        role: partner.role,
        avatarColor: partner.avatarColor,
      },
    });
  } catch (error) {
    console.error('partner_login_failed', error instanceof Error ? error.message : 'unknown_error');
    return NextResponse.json({ message: 'Não foi possível concluir o login.' }, { status: 500 });
  }
}
