import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { demoCredentials } from '../data/mockData';
import { authApi } from '../lib/dataService';
import { Card, Field, inputClassName } from './shared';

export const PartnerLoginPage = ({ session, onLoginSuccess, navigateTo }) => {
  const [formData, setFormData] = useState({
    email: authApi.isDemoMode ? demoCredentials.email : '',
    password: authApi.isDemoMode ? demoCredentials.password : '',
  });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session) {
      navigateTo('/socios');
    }
  }, [navigateTo, session]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const currentSession = await authApi.signIn(formData);
      setStatus('success');
      setMessage('Acesso liberado. Carregando o workspace interno.');
      onLoginSuccess(currentSession);
      navigateTo('/socios');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Nao foi possivel entrar.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigateTo('/')}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#0A0A0A]"
        >
          <ArrowLeft size={16} /> Voltar ao site
        </button>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[36px] bg-[#0A0A0A] p-8 text-white md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/50">Area interna</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">Controle comercial, entrega e financeiro em um so lugar.</h1>
            <p className="mt-5 max-w-xl text-white/70">
              Aqui os socios acompanham leads que chegam pelo site, transformam ideias em projetos, organizam ramificacoes, distribuem tarefas, controlam prazos, documentos e reparticao financeira.
            </p>

            <div className="mt-10 grid gap-4">
              {[
                'Leads capturados pelo formulario publico',
                'Projetos com cronograma, dono e percentual de entrega',
                'Ramificacoes e tarefas por responsavel',
                'Financeiro com divisao igual entre socios',
                'Historico de concluidos e documentos do cliente',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <CheckCircle2 size={18} className="mt-0.5" />
                  <span className="text-sm text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[36px] p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">Login dos socios</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0A0A0A]">Entrar no painel</h2>
            <p className="mt-3 text-gray-500">
              Use as credenciais dos socios cadastradas no Supabase Auth. Enquanto o Supabase nao estiver configurado, o modo demo ja funciona localmente.
            </p>

            {authApi.isDemoMode ? (
              <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                <p className="font-semibold">Modo demo ativo</p>
                <p className="mt-2">Email: {demoCredentials.email}</p>
                <p>Senha: {demoCredentials.password}</p>
              </div>
            ) : null}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <Field label="E-mail">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                  className={inputClassName}
                  placeholder="socio@vexcoding.com"
                />
              </Field>
              <Field label="Senha">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                  className={inputClassName}
                  placeholder="Sua senha"
                />
              </Field>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex w-full items-center justify-center rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'loading' ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {message ? (
              <div
                className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                  status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {message}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
};
