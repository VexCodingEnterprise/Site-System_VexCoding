'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, FileText, LoaderCircle, MessageSquareText, SearchCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { ClientPortalUpdate } from '@/types/dashboard';

const icons = {
  check: CheckCircle2,
  progress: LoaderCircle,
  message: MessageSquareText,
  upload: FileText,
  review: SearchCheck,
};

export function FeedAtualizacoes({
  updates,
  limit,
}: {
  updates: ClientPortalUpdate[];
  limit?: number;
}) {
  const visible = typeof limit === 'number' ? updates.slice(0, limit) : updates;

  return (
    <div className="panel">
      <div className="border-b border-[var(--line)] px-4 py-4">
        <p className="font-semibold text-[var(--text)]">Atualizacoes do projeto</p>
        <p className="mt-1 text-sm muted">Linha do tempo com os ultimos movimentos do projeto.</p>
      </div>

      <div className="space-y-0 px-4 py-2">
        {visible.map((update, index) => {
          const Icon = icons[update.icon] || CheckCircle2;
          return (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.28, delay: index * 0.03 }}
              className="relative border-l border-[var(--line)] pl-6"
            >
              <div className="absolute left-[-9px] top-5 flex h-4 w-4 items-center justify-center bg-[var(--panel)]">
                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel-alt)] text-[var(--text)]">
                  <Icon size={10} />
                </div>
              </div>
              <div className="py-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-medium text-[var(--text)]">{update.title}</p>
                  <p className="text-xs muted">{formatDateTime(update.createdAt)}</p>
                </div>
                {update.description ? <p className="mt-2 text-sm leading-7 muted">{update.description}</p> : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
