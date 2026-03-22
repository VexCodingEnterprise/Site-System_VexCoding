'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChecklistProgresso } from '@/components/cliente/ChecklistProgresso';
import { ChecklistRevisao } from '@/components/cliente/ChecklistRevisao';
import { ChecklistSecao } from '@/components/cliente/ChecklistSecao';
import { useClientePortal } from '@/components/cliente/cliente-portal-provider';
import { calculateChecklistProgress, getChecklistSectionProgress } from '@/lib/checklist';
import { formatDateTime } from '@/lib/utils';
import type { ChecklistResponseValue } from '@/types/dashboard';

const storageKey = (checklistId: string) => `vexcoding-checklist-${checklistId}`;

export function Checklist() {
  const {
    snapshot,
    loading,
    checklistSaving,
    saveChecklist,
    uploadChecklistFile,
    requestChecklistReopen,
  } = useClientePortal();
  const checklist = snapshot?.checklist || null;
  const [responses, setResponses] = useState<Record<string, ChecklistResponseValue>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [online, setOnline] = useState(true);
  const [submittedNow, setSubmittedNow] = useState(false);

  useEffect(() => {
    setOnline(typeof navigator === 'undefined' ? true : navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!checklist) {
      return;
    }

    const nextResponses = (snapshot?.checklistResponses || []).reduce<Record<string, ChecklistResponseValue>>(
      (accumulator, response) => {
        accumulator[response.itemId] = response.value;
        return accumulator;
      },
      {},
    );

    const stored =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(storageKey(checklist.id))
        : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Record<string, ChecklistResponseValue>;
        Object.assign(nextResponses, parsed);
      } catch {}
    }

    setResponses(nextResponses);
    setDirty(false);
    setSubmittedNow(false);
  }, [checklist, snapshot?.checklistResponses]);

  useEffect(() => {
    if (!checklist) {
      return;
    }

    window.localStorage.setItem(storageKey(checklist.id), JSON.stringify(responses));
  }, [checklist, responses]);

  useEffect(() => {
    if (!checklist || !dirty || !online || checklist.status === 'completo') {
      return;
    }

    const timeout = window.setTimeout(() => {
      void saveChecklist(
        Object.entries(responses).map(([itemId, value]) => ({ itemId, value })),
        {
          status:
            Object.keys(responses).length > 0 && checklist.status !== 'completo'
              ? 'em_preenchimento'
              : checklist.status,
          lastSavedAt: new Date().toISOString(),
        },
      ).then(() => setDirty(false));
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [checklist, dirty, online, responses, saveChecklist]);

  if (loading) {
    return <div className="panel px-4 py-6 text-sm muted">Carregando checklist do cliente...</div>;
  }

  if (!snapshot || !checklist) {
    return (
      <div className="panel px-4 py-6 text-sm muted">
        Nenhum checklist foi liberado para este projeto ainda.
      </div>
    );
  }

  const sections = [...checklist.structure.sections].sort((first, second) => first.order - second.order);
  const responseList = Object.entries(responses).map(([itemId, value]) => ({
    id: `${checklist.id}-${itemId}`,
    checklistId: checklist.id,
    itemId,
    value,
    updatedAt: new Date().toISOString(),
  }));
  const progress = calculateChecklistProgress(checklist, responseList);
  const currentSection = sections[currentSectionIndex];
  const currentItems = checklist.structure.items
    .filter((item) => item.sectionId === currentSection?.id)
    .sort((first, second) => first.order - second.order);
  const sectionProgress = currentSection
    ? getChecklistSectionProgress(checklist, responseList, currentSection.id)
    : { total: 0, answered: 0, percentage: 0 };

  const handleResponseChange = (itemId: string, value: ChecklistResponseValue) => {
    setResponses((current) => ({ ...current, [itemId]: value }));
    setDirty(true);
  };

  const submittedLocked = checklist.status === 'completo' && !submittedNow;

  if (submittedLocked) {
    return (
      <div className="space-y-4">
        <div className="panel px-4 py-6">
          <p className="text-xs uppercase tracking-[0.16em] muted">Checklist enviado</p>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--text)]">Recebemos tudo direitinho.</h1>
          <p className="mt-3 text-sm leading-7 muted">
            Enviado em {formatDateTime(checklist.submittedAt)}. A equipe VexCoding entrara em contato em breve pelo WhatsApp.
          </p>
          <button
            type="button"
            onClick={() => void requestChecklistReopen(checklist.id)}
            className="mt-4 h-12 w-full border border-[var(--line)] bg-[var(--panel-alt)] text-sm font-medium"
          >
            Solicitar reabertura
          </button>
        </div>
        <ChecklistRevisao
          checklist={checklist}
          responses={responses}
          onEditSection={() => {}}
          onSubmit={() => {}}
          submitting
        />
      </div>
    );
  }

  if (submittedNow) {
    return (
      <div className="panel px-4 py-10 text-center">
        <div className="mx-auto h-16 w-16 animate-pulse border border-[var(--text)] bg-[var(--text)]" />
        <h1 className="mt-6 text-2xl font-semibold text-[var(--text)]">Recebemos tudo!</h1>
        <p className="mt-3 text-sm leading-7 muted">
          A equipe VexCoding entrara em contato em breve pelo WhatsApp para confirmar o inicio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        <ChecklistProgresso
          currentSection={Math.min(currentSectionIndex + 1, sections.length)}
          totalSections={sections.length}
          title={reviewMode ? 'Revisao final' : currentSection?.title || 'Checklist'}
          percentage={reviewMode ? progress.percentage : sectionProgress.percentage}
        />

        {!online ? (
          <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Voce esta offline. Continuamos salvando localmente e enviaremos assim que a conexao voltar.
          </div>
        ) : null}

        {checklistSaving ? (
          <div className="border-b border-[var(--line)] bg-[var(--panel-alt)] px-4 py-3 text-sm muted">
            Salvando automaticamente...
          </div>
        ) : null}

        {reviewMode ? (
          <div className="p-4">
            <ChecklistRevisao
              checklist={checklist}
              responses={responses}
              onEditSection={(sectionIndex) => {
                setReviewMode(false);
                setCurrentSectionIndex(sectionIndex);
              }}
              submitting={checklistSaving}
              onSubmit={() => {
                if (!window.confirm('Tem certeza? Apos o envio voce nao podera editar sem reabertura.')) {
                  return;
                }

                void saveChecklist(
                  Object.entries(responses).map(([itemId, value]) => ({ itemId, value })),
                  {
                    status: 'completo',
                    submittedAt: new Date().toISOString(),
                    lastSavedAt: new Date().toISOString(),
                  },
                ).then(() => {
                  window.localStorage.removeItem(storageKey(checklist.id));
                  setSubmittedNow(true);
                });
              }}
            />
          </div>
        ) : currentSection ? (
          <ChecklistSecao
            section={currentSection}
            items={currentItems}
            responses={responses}
            onChange={handleResponseChange}
            onUpload={async (file) => {
              const uploaded = await uploadChecklistFile(snapshot.project.id, file);
              return {
                name: uploaded.name,
                url: uploaded.fileUrl,
                filePath: uploaded.filePath,
                mimeType: file.type || null,
                size: file.size || null,
              };
            }}
          />
        ) : null}
      </div>

      {!reviewMode ? (
        <div className="space-y-3">
          <button
            type="button"
            disabled={currentSectionIndex === 0}
            onClick={() => setCurrentSectionIndex((current) => Math.max(current - 1, 0))}
            className="h-12 w-full border border-[var(--line)] bg-[var(--panel)] text-sm font-medium disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => {
              if (currentSectionIndex >= sections.length - 1) {
                setReviewMode(true);
                return;
              }

              setCurrentSectionIndex((current) => current + 1);
            }}
            className="h-12 w-full border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)]"
          >
            {currentSectionIndex >= sections.length - 1 ? 'Ir para revisao' : 'Proxima'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setReviewMode(false)}
          className="h-12 w-full border border-[var(--line)] bg-[var(--panel)] text-sm font-medium"
        >
          Voltar para o checklist
        </button>
      )}
    </div>
  );
}
