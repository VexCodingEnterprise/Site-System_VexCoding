'use client';

import { DocumentosLista } from '@/components/cliente/DocumentosLista';
import { useClientePortal } from '@/components/cliente/cliente-portal-provider';

export function ClienteDocumentosPage() {
  const { snapshot, loading } = useClientePortal();

  if (loading || !snapshot) {
    return <div className="panel px-4 py-6 text-sm muted">Carregando documentos...</div>;
  }

  return <DocumentosLista documents={snapshot.documents} />;
}
