'use client';

import { useState } from 'react';
import type { ChecklistFileValue, ChecklistItem } from '@/types/dashboard';

export function CampoUploadMultiplo({
  item,
  value,
  onChange,
  onUpload,
}: {
  item: ChecklistItem;
  value: ChecklistFileValue[];
  onChange: (value: ChecklistFileValue[]) => void;
  onUpload: (file: File) => Promise<ChecklistFileValue>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="space-y-3">
      <label className="flex h-14 w-full cursor-pointer items-center justify-center border border-[var(--line)] bg-[var(--panel-alt)] px-4 text-sm font-medium">
        + Adicionar imagens
        <input
          className="hidden"
          type="file"
          multiple
          accept={item.acceptedFormats.join(',') || 'image/*'}
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            if (files.length === 0) {
              return;
            }

            setUploading(true);
            setError('');
            void Promise.all(files.map((file) => onUpload(file)))
              .then((uploaded) => {
                const next = [...value, ...uploaded].slice(0, item.maxFiles || 9);
                onChange(next);
              })
              .catch((uploadError) =>
                setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar as imagens.'),
              )
              .finally(() => {
                setUploading(false);
                event.target.value = '';
              });
          }}
        />
      </label>
      <p className="text-xs muted">
        Maximo: {item.maxFiles || 9} imagens. Toque em uma miniatura para remover.
      </p>
      {uploading ? <div className="panel-alt px-4 py-3 text-sm muted">Enviando imagens...</div> : null}
      {error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="grid grid-cols-3 gap-3">
        {value.map((file) => (
          <button
            key={file.url}
            type="button"
            onClick={() => onChange(value.filter((entry) => entry.url !== file.url))}
            className="aspect-square overflow-hidden border border-[var(--line)] bg-[var(--panel)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
