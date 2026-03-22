import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/auth';
import { uploadOfficialClientDocumentFile } from '@/lib/server/workspace-db';

export async function POST(request: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ message: 'Nao autenticado.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const projectId = String(formData.get('projectId') || '').trim();
    const file = formData.get('file');

    if (!projectId) {
      return NextResponse.json({ message: 'Projeto invalido.' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Selecione um arquivo valido.' }, { status: 400 });
    }

    const upload = await uploadOfficialClientDocumentFile(projectId, file);

    return NextResponse.json({
      name: file.name,
      filePath: upload.filePath,
      fileUrl: upload.fileUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Nao foi possivel enviar o documento do cliente.' },
      { status: 500 },
    );
  }
}
