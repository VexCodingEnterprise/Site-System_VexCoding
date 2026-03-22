'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

export function LoginView({ redirectTo = '/dashboard' }: { redirectTo?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch(redirectTo || '/dashboard');
  }, [redirectTo, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text)]"
        >
          <ArrowLeft size={15} /> Voltar ao site
        </Link>

        <div className="panel">
          <div className="border-b border-[var(--line)] px-6 py-8 text-center">
            <BrandLogo centered />
            <h1 className="mt-5 text-2xl font-semibold text-[var(--text)]">Area dos socios</h1>
            <p className="mt-2 text-sm muted">Entre no painel interno para acompanhar operacao, projetos e financeiro.</p>
          </div>

          <form
            className="space-y-4 px-6 py-6"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setMessage('');

              try {
                const response = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(form),
                });
                const payload = (await response.json()) as { message?: string };

                if (!response.ok) {
                  throw new Error(payload.message || 'Nao foi possivel entrar.');
                }

                router.push(redirectTo || '/dashboard');
              } catch (loginError) {
                setMessage(loginError instanceof Error ? loginError.message : 'Nao foi possivel entrar.');
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--text)]">Usuario</span>
              <input
                className="field"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder="Seu usuario"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--text)]">Senha</span>
              <input
                type="password"
                className="field"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Sua senha"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full border border-[var(--text)] bg-[var(--text)] text-sm font-medium text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            {message ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
