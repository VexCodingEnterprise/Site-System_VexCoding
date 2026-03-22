'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { projectTypeOptions } from '@/data/demo';
import { getStoredMode, getDemoWorkspace, saveDemoWorkspace } from '@/lib/demo-store';
import { createId } from '@/lib/utils';

export function PublicSite() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    projectType: projectTypeOptions[0],
    message: '',
  });
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#0A0A0A] text-white">VC</div>
            <span className="text-sm font-semibold">VexCoding</span>
          </div>
          <Link href="/login" className="text-sm font-medium text-[#0A0A0A]">
            Area dos socios
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-black/10 px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm uppercase tracking-[0.28em] text-black/40">VexCoding</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight md:text-7xl">
              Sistemas internos, operacoes digitais e produtos sob medida com execucao cirurgica.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-black/60">
              A mesma estrutura que organiza nossa operacao interna tambem organiza o que entregamos para os clientes.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#contato" className="inline-flex items-center gap-2 border border-[#0A0A0A] bg-[#0A0A0A] px-5 py-3 text-sm font-medium text-white">
                Solicitar proposta <ArrowRight size={16} />
              </a>
              <Link href="/login" className="inline-flex items-center gap-2 border border-black/10 px-5 py-3 text-sm font-medium">
                Entrar na area interna
              </Link>
            </div>
          </div>
        </section>

        <section className="grid border-b border-black/10 md:grid-cols-3">
          {[
            ['Leads', 'Os contatos do site entram direto no painel interno para qualificacao.'],
            ['Projetos', 'Cada projeto ganha modulos, tarefas, financeiro e documentos.'],
            ['Controle', 'Os 3 socios acompanham tudo em uma estrutura unica e limpa.'],
          ].map(([title, description]) => (
            <div key={title} className="border-r border-black/10 px-6 py-10 last:border-r-0">
              <p className="text-xl font-semibold">{title}</p>
              <p className="mt-3 text-sm leading-7 text-black/60">{description}</p>
            </div>
          ))}
        </section>

        <section id="contato" className="px-6 py-20">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-black/40">Contato</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Vamos falar do seu projeto.</h2>
              <p className="mt-6 text-base leading-8 text-black/60">
                No modo oficial, esse formulario envia leads direto para o Supabase. No modo demo, ele alimenta os dados ficticios locais.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-black/60">
                <ShieldCheck size={16} />
                <span>Fluxo preparado para Netlify + Supabase</span>
              </div>
            </div>

            <form
              className="space-y-4 border border-black/10 bg-white p-6"
              onSubmit={async (event) => {
                event.preventDefault();

                if (getStoredMode() === 'official') {
                  const response = await fetch('/api/public/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                  });
                  const payload = (await response.json()) as { message?: string };
                  setMessage(response.ok ? 'Lead enviado com sucesso.' : payload.message || 'Nao foi possivel enviar.');
                  return;
                }

                const db = getDemoWorkspace();
                db.leads.unshift({
                  id: createId('lead'),
                  name: form.name,
                  email: form.email,
                  projectType: form.projectType,
                  message: form.message,
                  status: 'Novo',
                  createdAt: new Date().toISOString(),
                  convertedAt: null,
                  projectId: null,
                });
                saveDemoWorkspace(db);
                setMessage('Lead salvo no modo demo.');
              }}
            >
              <input className="field" placeholder="Seu nome" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <input className="field" placeholder="Seu e-mail" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              <select className="field" value={form.projectType} onChange={(event) => setForm((current) => ({ ...current, projectType: event.target.value }))}>
                {projectTypeOptions.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <textarea className="field" rows={5} placeholder="Conte o que voce quer construir" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
              <button type="submit" className="h-11 w-full border border-[#0A0A0A] bg-[#0A0A0A] text-sm font-medium text-white">
                Enviar
              </button>
              {message ? <p className="text-sm text-black/60">{message}</p> : null}
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-sm text-black/60">
          <span>© 2026 VexCoding</span>
          <Link href="/login" className="font-medium text-[#0A0A0A]">
            Area dos socios
          </Link>
        </div>
      </footer>
    </div>
  );
}
