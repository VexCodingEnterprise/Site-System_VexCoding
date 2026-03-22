'use client';

import { CampoCor } from '@/components/cliente/campos/CampoCor';
import { CampoEscolhaUnica } from '@/components/cliente/campos/CampoEscolhaUnica';
import { CampoLink } from '@/components/cliente/campos/CampoLink';
import { CampoMultiplaEscolha } from '@/components/cliente/campos/CampoMultiplaEscolha';
import { CampoSimNao } from '@/components/cliente/campos/CampoSimNao';
import { CampoTexto } from '@/components/cliente/campos/CampoTexto';
import { CampoTextLongo } from '@/components/cliente/campos/CampoTextLongo';
import { CampoUpload } from '@/components/cliente/campos/CampoUpload';
import { CampoUploadMultiplo } from '@/components/cliente/campos/CampoUploadMultiplo';
import type {
  ChecklistFileValue,
  ChecklistItem,
  ChecklistResponse,
  ChecklistResponseValue,
  ChecklistSection,
} from '@/types/dashboard';

const getResponseValue = (responses: Record<string, ChecklistResponseValue>, itemId: string) =>
  responses[itemId] ?? null;

const toStringArray = (value: ChecklistResponseValue) => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  if (typeof value === 'string' && value) {
    return [value];
  }

  return [];
};

const toFile = (value: ChecklistResponseValue) =>
  value && !Array.isArray(value) && typeof value === 'object' && 'url' in value ? (value as ChecklistFileValue) : null;

const toFiles = (value: ChecklistResponseValue) =>
  Array.isArray(value) ? value.filter((entry): entry is ChecklistFileValue => typeof entry === 'object' && entry !== null && 'url' in entry) : [];

export function ChecklistSecao({
  section,
  items,
  responses,
  onChange,
  onUpload,
}: {
  section: ChecklistSection;
  items: ChecklistItem[];
  responses: Record<string, ChecklistResponseValue>;
  onChange: (itemId: string, value: ChecklistResponseValue) => void;
  onUpload: (file: File) => Promise<ChecklistFileValue>;
}) {
  return (
    <div className="space-y-6 p-4">
      {section.description ? <p className="text-sm leading-7 muted">{section.description}</p> : null}

      {items.map((item) => {
        const value = getResponseValue(responses, item.id);
        return (
          <div key={item.id} className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                {item.required ? <span className="text-xs font-medium text-red-600">*</span> : null}
              </div>
              {item.helpText ? <p className="mt-1 text-sm muted">{item.helpText}</p> : null}
            </div>

            {item.type === 'text' ? (
              <CampoTexto item={item} value={typeof value === 'string' ? value : ''} onChange={(next) => onChange(item.id, next)} />
            ) : null}

            {item.type === 'textarea' ? (
              <CampoTextLongo item={item} value={typeof value === 'string' ? value : ''} onChange={(next) => onChange(item.id, next)} />
            ) : null}

            {item.type === 'file' ? (
              <CampoUpload item={item} value={toFile(value)} onChange={(next) => onChange(item.id, next)} onUpload={onUpload} />
            ) : null}

            {item.type === 'image_gallery' ? (
              <CampoUploadMultiplo
                item={item}
                value={toFiles(value)}
                onChange={(next) => onChange(item.id, next)}
                onUpload={onUpload}
              />
            ) : null}

            {item.type === 'single_choice' ? (
              <CampoEscolhaUnica item={item} value={typeof value === 'string' ? value : ''} onChange={(next) => onChange(item.id, next)} />
            ) : null}

            {item.type === 'multi_choice' ? (
              <CampoMultiplaEscolha item={item} value={toStringArray(value)} onChange={(next) => onChange(item.id, next)} />
            ) : null}

            {item.type === 'link' ? (
              <CampoLink value={toStringArray(value)} onChange={(next) => onChange(item.id, next)} />
            ) : null}

            {item.type === 'color' ? (
              <CampoCor value={toStringArray(value)} onChange={(next) => onChange(item.id, next)} />
            ) : null}

            {item.type === 'boolean' ? (
              <CampoSimNao value={typeof value === 'boolean' ? value : false} onChange={(next) => onChange(item.id, next)} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
