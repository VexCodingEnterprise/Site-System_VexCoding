'use client';

import { ChatMensagens } from '@/components/cliente/ChatMensagens';
import { useClientePortal } from '@/components/cliente/cliente-portal-provider';

export function ClienteMensagensPage() {
  const { snapshot, loading, sendMessage, sending } = useClientePortal();

  if (loading || !snapshot) {
    return <div className="panel px-4 py-6 text-sm muted">Carregando mensagens...</div>;
  }

  return <ChatMensagens messages={snapshot.messages} currentSenderType="cliente" onSend={sendMessage} sending={sending} />;
}
