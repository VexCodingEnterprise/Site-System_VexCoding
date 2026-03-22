'use client';

import { useMemo, useState } from 'react';
import { ChatMensagens } from '@/components/cliente/ChatMensagens';
import { DocumentosLista } from '@/components/cliente/DocumentosLista';
import { FeedAtualizacoes } from '@/components/cliente/FeedAtualizacoes';
import { Panel, SectionTitle } from '@/components/dashboard/common';
import { CriarAcessoCliente } from '@/components/dashboard/projeto/CriarAcessoCliente';
import { EtapasEditor } from '@/components/dashboard/projeto/EtapasEditor';
import { useDashboard } from '@/components/providers/dashboard-provider';

const documentKinds = ['contrato', 'briefing', 'layout', 'outros'] as const;

export function PortalClienteAba({
  projectId,
}: {
  projectId: string;
}) {
  const {
    workspace,
    session,
    createClientUpdate,
    createClientMessage,
    createClientDocument,
    uploadClientDocumentFile,
  } = useDashboard();

  const updates = useMemo(
    () => (workspace?.clientUpdates || []).filter((item) => item.projectId === projectId),
    [workspace?.clientUpdates, projectId],
  );
  const messages = useMemo(
    () => (workspace?.clientMessages || []).filter((item) => item.projectId === projectId),
    [workspace?.clientMessages, projectId],
  );
  const documents = useMemo(
    () => (workspace?.clientDocuments || []).filter((item) => item.projectId === projectId),
    [workspace?.clientDocuments, projectId],
  );

  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    icon: 'progress' as const,
  });
  const [documentForm, setDocumentForm] = useState({
    name: '',
    kind: 'outros' as const,
    url: '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  return (
    <div className="space-y-4">
      <CriarAcessoCliente projectId={projectId} />

      <EtapasEditor projectId={projectId} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel>
          <SectionTitle title="Feed de atualizacoes" description="Atualizacoes que o cliente vai visualizar no portal." />
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px]">
              <input
                className="field"
                placeholder="Titulo da atualizacao"
                value={updateForm.title}
                onChange={(event) => setUpdateForm((current) => ({ ...current, title: event.target.value }))}
              />
              <select
                className="field"
                value={updateForm.icon}
                onChange={(event) =>
                  setUpdateForm((current) => ({ ...current, icon: event.target.value as typeof current.icon }))
                }
              >
                <option value="check">check</option>
                <option value="progress">progress</option>
                <option value="message">message</option>
                <option value="upload">upload</option>
                <option value="review">review</option>
              </select>
            </div>
            <textarea
              className="field"
              rows={3}
              placeholder="Descricao opcional"
              value={updateForm.description}
              onChange={(event) => setUpdateForm((current) => ({ ...current, description: event.target.value }))}
            />
            <button
              type="button"
              disabled={!updateForm.title}
              onClick={() =>
                void createClientUpdate({
                  projectId,
                  title: updateForm.title,
                  description: updateForm.description || null,
                  icon: updateForm.icon,
                }).then(() => setUpdateForm({ title: '', description: '', icon: 'progress' }))
              }
              className="h-11 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Publicar atualizacao
            </button>
            <FeedAtualizacoes updates={updates} limit={10} />
          </div>
        </Panel>

        <Panel>
          <SectionTitle title="Documentos do cliente" description="Arquivos disponibilizados no portal do cliente." />
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                className="field md:col-span-2"
                placeholder="Nome do documento"
                value={documentForm.name}
                onChange={(event) => setDocumentForm((current) => ({ ...current, name: event.target.value }))}
              />
              <select
                className="field"
                value={documentForm.kind}
                onChange={(event) =>
                  setDocumentForm((current) => ({ ...current, kind: event.target.value as typeof current.kind }))
                }
              >
                {documentKinds.map((kind) => (
                  <option key={kind}>{kind}</option>
                ))}
              </select>
            </div>
            <input className="field" type="file" onChange={(event) => setDocumentFile(event.target.files?.[0] || null)} />
            <input
              className="field"
              placeholder="URL manual do documento"
              value={documentForm.url}
              onChange={(event) => setDocumentForm((current) => ({ ...current, url: event.target.value }))}
            />
            <button
              type="button"
              disabled={!documentForm.name || (!documentFile && !documentForm.url)}
              onClick={() =>
                void (async () => {
                  if (documentFile) {
                    const uploaded = await uploadClientDocumentFile(projectId, documentFile);
                    await createClientDocument({
                      projectId,
                      name: documentForm.name || uploaded.name,
                      kind: documentForm.kind,
                      url: uploaded.fileUrl,
                      filePath: uploaded.filePath,
                    });
                  } else {
                    await createClientDocument({
                      projectId,
                      name: documentForm.name,
                      kind: documentForm.kind,
                      url: documentForm.url,
                      filePath: null,
                    });
                  }

                  setDocumentFile(null);
                  setDocumentForm({ name: '', kind: 'outros', url: '' });
                })()
              }
              className="h-11 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Adicionar documento do cliente
            </button>
            <DocumentosLista documents={documents} />
          </div>
        </Panel>
      </div>

      <ChatMensagens
        messages={messages}
        currentSenderType="socio"
        onSend={(text) =>
          createClientMessage({
            projectId,
            senderType: 'socio',
            senderName: session.displayName,
            text,
          })
        }
      />
    </div>
  );
}
