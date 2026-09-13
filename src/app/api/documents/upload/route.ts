import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/auth';
import { uploadOfficialDocumentFile } from '@/lib/server/workspace-db';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const projectId = String(formData.get('projectId') || '').trim();
    const file = formData.get('file');

    if (!projectId) {
      return NextResponse.json({ message: 'Projeto inválido.' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Selecione um arquivo valido.' }, { status: 400 });
    }

    const upload = await uploadOfficialDocumentFile(projectId, file);

    return NextResponse.json({
      name: file.name,
      filePath: upload.filePath,
      fileUrl: upload.fileUrl,
    });
  } catch (error) {
    console.error('document_upload_failed', error instanceof Error ? error.message : 'unknown_error');
    const message = error instanceof Error && /Arquivo inválido|Projeto não encontrado/.test(error.message)
      ? error.message
      : 'Não foi possível enviar o documento.';
    return NextResponse.json({ message }, { status: 400 });
  }
}
