'use client';

import { useMemo, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { ClientPortalMessage } from '@/types/dashboard';

export function ChatMensagens({
  messages,
  currentSenderType,
  onSend,
  sending = false,
}: {
  messages: ClientPortalMessage[];
  currentSenderType: 'cliente' | 'socio';
  onSend: (text: string) => Promise<void> | void;
  sending?: boolean;
}) {
  const [text, setText] = useState('');
  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  );

  return (
    <div className="panel">
      <div className="border-b border-[var(--line)] px-4 py-4">
        <p className="font-semibold text-[var(--text)]">Mensagens</p>
        <p className="mt-1 text-sm muted">Conversa direta entre cliente e equipe do projeto.</p>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {orderedMessages.map((message) => {
            const mine = message.senderType === currentSenderType;
            return (
              <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div className={mine ? 'max-w-[82%]' : 'max-w-[82%]'}>
                  <div
                    className={
                      mine
                        ? 'border border-[var(--text)] bg-[var(--text)] px-4 py-3 text-sm text-white'
                        : 'border border-[var(--line)] bg-[var(--panel-alt)] px-4 py-3 text-sm text-[var(--text)]'
                    }
                  >
                    <p className="whitespace-pre-wrap leading-7">{message.text}</p>
                  </div>
                  <div className={mine ? 'mt-2 text-right' : 'mt-2 text-left'}>
                    <p className="text-xs muted">
                      {message.senderName} • {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="flex gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!text.trim()) {
              return;
            }

            await onSend(text.trim());
            setText('');
          }}
        >
          <input
            className="field"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escreva sua mensagem"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="inline-flex h-11 items-center gap-2 border border-[var(--text)] bg-[var(--text)] px-4 text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SendHorizontal size={15} />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
