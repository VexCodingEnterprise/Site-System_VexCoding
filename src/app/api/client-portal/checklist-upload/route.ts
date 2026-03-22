import { NextResponse } from 'next/server';
import { assertOfficialMode } from '@/lib/server/supabase-admin';
import { uploadOfficialChecklistFile } from '@/lib/server/workspace-db';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
    }

    const supabase = assertOfficialMode();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ message: 'Sessao do cliente invalida.' }, { status: 401 });
    }

    const formData = await request.formData();
    const projectId = String(formData.get('projectId') || '').trim();
    const file = formData.get('file');

    if (!projectId) {
      return NextResponse.json({ message: 'Projeto invalido.' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Selecione um arquivo valido.' }, { status: 400 });
    }

    const { data: clientRow, error: clientError } = await supabase
      .from('clientes')
      .select('projeto_id')
      .eq('user_id', data.user.id)
      .eq('projeto_id', projectId)
      .maybeSingle();

    if (clientError || !clientRow) {
      return NextResponse.json(
        { message: clientError?.message || 'Projeto nao pertence a este cliente.' },
        { status: 403 },
      );
    }

    const upload = await uploadOfficialChecklistFile(projectId, file);

    return NextResponse.json({
      name: file.name,
      filePath: upload.filePath,
      fileUrl: upload.fileUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Nao foi possivel enviar o arquivo do checklist.' },
      { status: 500 },
    );
  }
}
