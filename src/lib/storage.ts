export const uploadFileToRoute = async ({
  endpoint,
  projectId,
  file,
}: {
  endpoint: string;
  projectId: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('file', file);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json()) as {
    fileUrl?: string;
    filePath?: string | null;
    name?: string;
    message?: string;
  };

  if (!response.ok || !payload.fileUrl) {
    throw new Error(payload.message || 'Não foi possível enviar o arquivo.');
  }

  return {
    name: payload.name || file.name,
    fileUrl: payload.fileUrl,
    filePath: payload.filePath || null,
  };
};
