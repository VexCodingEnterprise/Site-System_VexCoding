'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase, hasBrowserSupabaseConfig } from '@/lib/supabase';
import type {
  ChecklistResponseValue,
  ClientPortalMessage,
  ClientPortalSnapshot,
  ProjectChecklist,
} from '@/types/dashboard';

interface ClientePortalContextValue {
  snapshot: ClientPortalSnapshot | null;
  loading: boolean;
  sending: boolean;
  checklistSaving: boolean;
  error: string;
  clientName: string;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  saveChecklist: (
    responses: Array<{ itemId: string; value: ChecklistResponseValue }>,
    checklistPatch?: Partial<Pick<ProjectChecklist, 'status' | 'releasedAt' | 'submittedAt' | 'reopenedAt' | 'lastSavedAt'>>,
  ) => Promise<void>;
  uploadChecklistFile: (projectId: string, file: File) => Promise<{ name: string; fileUrl: string; filePath: string | null }>;
  requestChecklistReopen: (checklistId: string) => Promise<void>;
}

const ClientePortalContext = createContext<ClientePortalContextValue | null>(null);

export function ClientePortalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<ClientPortalSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [checklistSaving, setChecklistSaving] = useState(false);
  const [error, setError] = useState('');

  const resolveSupabase = useCallback(() => {
    if (!hasBrowserSupabaseConfig) {
      throw new Error('Area do cliente ainda nao esta conectada ao Supabase.');
    }

    return getBrowserSupabase();
  }, []);

  const getAccessToken = useCallback(async () => {
    const supabase = resolveSupabase();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  }, [resolveSupabase]);

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getAccessToken();

      if (!token) {
        setSnapshot(null);
        router.replace('/cliente');
        return;
      }

      const response = await fetch('/api/client-portal', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const payload = (await response.json()) as { snapshot?: ClientPortalSnapshot; message?: string };

      if (!response.ok || !payload.snapshot) {
        throw new Error(payload.message || 'Nao foi possivel carregar o portal do cliente.');
      }

      setSnapshot(payload.snapshot);
    } catch (loadError) {
      setSnapshot(null);
      setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar o portal do cliente.');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, router]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    void loadSnapshot();

    try {
      const supabase = resolveSupabase();

      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          setSnapshot(null);
          router.replace('/cliente');
        }
      }).data.subscription;
    } catch (supabaseError) {
      setError(supabaseError instanceof Error ? supabaseError.message : 'Nao foi possivel iniciar o portal do cliente.');
      setLoading(false);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, [loadSnapshot, resolveSupabase, router]);

  useEffect(() => {
    if (!snapshot?.project.id) {
      return;
    }

    let supabase;

    try {
      supabase = resolveSupabase();
    } catch {
      return;
    }

    const channel = supabase
      .channel(`client-project-messages-${snapshot.project.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_projeto',
          filter: `projeto_id=eq.${snapshot.project.id}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const nextMessage: ClientPortalMessage = {
            id: String(row.id),
            projectId: String(row.projeto_id),
            senderType: row.remetente_tipo as ClientPortalMessage['senderType'],
            senderName: String(row.remetente_nome),
            text: String(row.texto),
            createdAt: String(row.criado_em),
          };

          setSnapshot((current) => {
            if (!current || current.messages.some((message) => message.id === nextMessage.id)) {
              return current;
            }

            return {
              ...current,
              messages: [nextMessage, ...current.messages],
            };
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [resolveSupabase, snapshot?.project.id]);

  const logout = useCallback(async () => {
    const supabase = resolveSupabase();
    await supabase.auth.signOut();
    setSnapshot(null);
    router.replace('/cliente');
  }, [resolveSupabase, router]);

  const sendMessage = useCallback(async (text: string) => {
    if (!snapshot) {
      return;
    }

    setSending(true);
    setError('');
    try {
      const supabase = resolveSupabase();
      const { error: insertError } = await supabase.from('mensagens_projeto').insert({
        projeto_id: snapshot.project.id,
        remetente_tipo: 'cliente',
        remetente_nome: snapshot.client.name,
        texto: text,
      } as never);

      if (insertError) {
        throw new Error(insertError.message);
      }
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : 'Nao foi possivel enviar a mensagem.');
    } finally {
      setSending(false);
    }
  }, [resolveSupabase, snapshot]);

  const saveChecklist = useCallback(async (
    responses: Array<{ itemId: string; value: ChecklistResponseValue }>,
    checklistPatch?: Partial<Pick<ProjectChecklist, 'status' | 'releasedAt' | 'submittedAt' | 'reopenedAt' | 'lastSavedAt'>>,
  ) => {
    if (!snapshot?.checklist) {
      return;
    }

    setChecklistSaving(true);
    setError('');

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Sessao expirada. Entre novamente para continuar.');
      }

      const response = await fetch('/api/client-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'checklist-save',
          checklistId: snapshot.checklist.id,
          responses,
          checklistPatch,
        }),
      });

      const payload = (await response.json()) as { snapshot?: ClientPortalSnapshot; message?: string };

      if (!response.ok || !payload.snapshot) {
        throw new Error(payload.message || 'Nao foi possivel salvar o checklist.');
      }

      setSnapshot(payload.snapshot);
    } catch (checklistError) {
      setError(checklistError instanceof Error ? checklistError.message : 'Nao foi possivel salvar o checklist.');
    } finally {
      setChecklistSaving(false);
    }
  }, [getAccessToken, snapshot]);

  const uploadChecklistFile = useCallback(async (projectId: string, file: File) => {
    const token = await getAccessToken();

    if (!token) {
      throw new Error('Sessao expirada. Entre novamente para continuar.');
    }

    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);

    const response = await fetch('/api/client-portal/checklist-upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const payload = (await response.json()) as {
      name?: string;
      fileUrl?: string;
      filePath?: string | null;
      message?: string;
    };

    if (!response.ok || !payload.fileUrl) {
      throw new Error(payload.message || 'Nao foi possivel enviar o arquivo.');
    }

    return {
      name: payload.name || file.name,
      fileUrl: payload.fileUrl,
      filePath: payload.filePath || null,
    };
  }, [getAccessToken]);

  const requestChecklistReopen = useCallback(async (checklistId: string) => {
    setChecklistSaving(true);
    setError('');

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Sessao expirada. Entre novamente para continuar.');
      }

      const response = await fetch('/api/client-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'checklist-request-reopen',
          checklistId,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || 'Nao foi possivel solicitar a reabertura.');
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Nao foi possivel solicitar a reabertura.');
    } finally {
      setChecklistSaving(false);
    }
  }, [getAccessToken]);

  const value = useMemo<ClientePortalContextValue>(
    () => ({
      snapshot,
      loading,
      sending,
      checklistSaving,
      error,
      clientName: snapshot?.client.name || '',
      logout,
      reload: loadSnapshot,
      sendMessage,
      saveChecklist,
      uploadChecklistFile,
      requestChecklistReopen,
    }),
    [
      snapshot,
      loading,
      sending,
      checklistSaving,
      error,
      logout,
      loadSnapshot,
      sendMessage,
      saveChecklist,
      uploadChecklistFile,
      requestChecklistReopen,
    ],
  );

  return <ClientePortalContext.Provider value={value}>{children}</ClientePortalContext.Provider>;
}

export function useClientePortal() {
  const context = useContext(ClientePortalContext);
  if (!context) {
    throw new Error('useClientePortal precisa ser usado dentro de ClientePortalProvider.');
  }
  return context;
}
