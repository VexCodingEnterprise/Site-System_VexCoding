'use client';

import { FileText, Download } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { ClientPortalDocument } from '@/types/dashboard';

const labels = {
  contrato: 'Contrato',
  briefing: 'Briefing',
  layout: 'Layout',
  outros: 'Outros',
};

export function DocumentosLista({
  documents,
}: {
  documents: ClientPortalDocument[];
}) {
  return (
    <div className="panel">
      <div className="border-b border-[var(--line)] px-4 py-4">
        <p className="font-semibold text-[var(--text)]">Documentos</p>
        <p className="mt-1 text-sm muted">Arquivos liberados pela equipe da VexCoding para este projeto.</p>
      </div>

      <div className="divide-y divide-[var(--line)]">
        {documents.map((document) => (
          <div key={document.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--panel-alt)]">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{document.name}</p>
                <p className="mt-1 text-xs muted">
                  {labels[document.kind]} • {formatDateTime(document.createdAt)}
                </p>
              </div>
            </div>

            <a
              href={document.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-medium"
            >
              <Download size={14} />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
