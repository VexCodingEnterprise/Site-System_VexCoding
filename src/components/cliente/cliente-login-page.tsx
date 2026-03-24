'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { demoClientPassword, signInDemoClient } from '@/lib/client-portal-demo';
import { getBrowserSupabase, hasBrowserSupabaseConfig } from '@/lib/supabase';

export function ClienteLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    router.prefetch('/cliente/dashboard');
  }, [router]);

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
            <h1 className="mt-5 text-2xl font-semibold text-[var(--text)]">Portal do cliente</h1>
            <p className="mt-2 text-sm muted">Acesse o andamento do seu projeto em tempo real.</p>
          </div>

          <form
            className="space-y-4 px-6 py-6"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setMessage('');

              try {
                if (!hasBrowserSupabaseConfig) {
                  signInDemoClient(form.identifier, form.password);
                  window.location.assign('/cliente/dashboard');
                  return;
                }

                const resolveResponse = await fetch('/api/client-auth/resolve', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ identifier: form.identifier }),
                });
                const resolvePayload = (await resolveResponse.json()) as { email?: string; message?: string };

                if (!resolveResponse.ok || !resolvePayload.email) {
                  throw new Error(resolvePayload.message || 'Nao foi possivel localizar o acesso do cliente.');
                }

                const supabase = getBrowserSupabase();
                const { data, error } = await supabase.auth.signInWithPassword({
                  email: resolvePayload.email,
                  password: form.password,
                });

                if (error) {
                  throw new Error(error.message);
                }

                if (!data.session) {
                  throw new Error('Nao foi possivel iniciar a sessao do cliente.');
                }

                window.location.assign('/cliente/dashboard');
              } catch (loginError) {
                setMessage(loginError instanceof Error ? loginError.message : 'Nao foi possivel entrar.');
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--text)]">E-mail ou nome</span>
              <input
                className="field"
                value={form.identifier}
                onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))}
                placeholder="cliente@empresa.com ou nome do cliente"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--text)]">Senha</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="field pr-12"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[var(--muted)] transition hover:text-[var(--text)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {!hasBrowserSupabaseConfig ? (
              <div className="border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-sm muted">
                Use o e-mail ou o nome do cliente cadastrado e a senha definida. Se nao houver uma senha personalizada no demo, use `{demoClientPassword}`.
              </div>
            ) : null}

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
