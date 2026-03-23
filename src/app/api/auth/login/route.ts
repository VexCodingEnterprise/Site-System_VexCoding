import { NextResponse } from 'next/server';
import { getDefaultPartner, setSessionCookie, verifyPassword } from '@/lib/server/auth';
import { hasOfficialSupabase } from '@/lib/server/config';
import { verifyOfficialPartner } from '@/lib/server/workspace-db';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim().toLowerCase();
    const password = body.password?.trim();

    if (!username || !password) {
      return NextResponse.json({ message: 'Usuario e senha sao obrigatorios.' }, { status: 400 });
    }

    let partner = null;

    if (hasOfficialSupabase()) {
      try {
        partner = await verifyOfficialPartner(username, password);
      } catch {
        partner = null;
      }
    }

    if (!partner) {
      const fallbackPartner = getDefaultPartner(username);
      if (!fallbackPartner || !verifyPassword(fallbackPartner, password)) {
        return NextResponse.json({ message: 'Credenciais invalidas.' }, { status: 401 });
      }
      partner = fallbackPartner;
    }

    setSessionCookie(partner);

    return NextResponse.json({
      session: {
        partnerId: partner.id,
        username: partner.username,
        displayName: partner.displayName,
        role: partner.role,
        avatarColor: partner.avatarColor,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Nao foi possivel concluir o login.' },
      { status: 500 },
    );
  }
}
