'use client';

import { useState } from 'react';
import type { ChecklistFileValue, ChecklistItem } from '@/types/dashboard';

export function CampoUpload({
  item,
  value,
  onChange,
  onUpload,
}: {
  item: ChecklistItem;
  value: ChecklistFileValue | null;
  onChange: (value: ChecklistFileValue | null) => void;
  onUpload: (file: File) => Promise<ChecklistFileValue>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="space-y-3">
      <label className="flex h-14 w-full cursor-pointer items-center justify-center border border-[var(--line)] bg-[var(--panel-alt)] px-4 text-sm font-medium">
        Tirar foto ou escolher arquivo
        <input
          className="hidden"
          type="file"
          accept={item.acceptedFormats.join(',') || undefined}
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            setUploading(true);
            setError('');
            void onUpload(file)
              .then((uploaded) => onChange(uploaded))
              .catch((uploadError) =>
                setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar o arquivo.'),
              )
              .finally(() => {
                setUploading(false);
                event.target.value = '';
              });
          }}
        />
      </label>
      <p className="text-xs muted">
        Formatos aceitos: {item.acceptedFormats.join(', ') || 'imagem, PDF ou ZIP'}.
        {' '}Max. 10MB.
      </p>
      {uploading ? <div className="panel-alt px-4 py-3 text-sm muted">Enviando arquivo...</div> : null}
      {error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {value ? (
        <div className="border border-[var(--line)] bg-[var(--panel)] px-4 py-4">
          <p className="text-sm font-medium text-[var(--text)]">{value.name}</p>
          <div className="mt-3 flex flex-col gap-3">
            <a href={value.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
              Visualizar arquivo
            </a>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="h-11 border border-[var(--line)] bg-[var(--panel-alt)] text-sm font-medium"
            >
              Remover arquivo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
