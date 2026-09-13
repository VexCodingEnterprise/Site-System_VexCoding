import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Code2,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageSquare,
  ShieldCheck,
  ShoppingCart,
  Wrench,
  X,
} from 'lucide-react';
import { serviceTypes } from '../data/public-content';
import { Card, FadeUp, Field, ParticlesBackground, SectionHeading, inputClassName } from './shared';

const MotionDiv = motion.div;

const createContactForm = () => ({
  name: '',
  email: '',
  company: '',
  project_type: serviceTypes[0],
  message: '',
});

export const Navbar = ({ onOpenLogin, onOpenClientArea }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Serviços', href: '#servicos' },
    { name: 'Soluções', href: '#portfolio' },
    { name: 'Diferenciais', href: '#diferenciais' },
    { name: 'Contato', href: '#contato' },
  ];

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'border-b border-gray-100 bg-white/85 py-3 shadow-sm backdrop-blur-md' : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
        <a href="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A0A0A] text-white transition-transform group-hover:scale-105">
            <Code2 size={20} strokeWidth={2.4} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0A0A0A]">VexCoding</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-[#0A0A0A]"
            >
              {link.name}
            </a>
          ))}
          <button
            type="button"
            onClick={onOpenLogin}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#0A0A0A] transition hover:border-[#0A0A0A] hover:bg-gray-50"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={onOpenClientArea}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#0A0A0A] transition hover:border-[#0A0A0A] hover:bg-gray-50"
          >
            Área do cliente
          </button>
          <a
            href="#contato"
            className="rounded-xl bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
          >
            Solicitar orçamento
          </a>
        </nav>

        <button type="button" className="text-[#0A0A0A] md:hidden" onClick={() => setMobileMenuOpen((value) => !value)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <MotionDiv
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-gray-100 bg-white md:hidden"
          >
            <div className="flex flex-col gap-3 px-6 py-5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-2 py-2 text-base font-medium text-gray-600 transition hover:bg-gray-50 hover:text-[#0A0A0A]"
                >
                  {link.name}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-[#0A0A0A]"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenClientArea();
                }}
                className="rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium text-[#0A0A0A]"
              >
                Área do cliente
              </button>
              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-[#0A0A0A] px-4 py-3 text-center text-sm font-medium text-white"
              >
                Solicitar orçamento
              </a>
            </div>
          </MotionDiv>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export const Hero = () => (
  <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white pt-20">
    <ParticlesBackground />
    <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
      <FadeUp>
        <h1 className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight text-[#0A0A0A] md:text-7xl">
          Alguns vendem sites.
          <br />
          A <span className="bg-gradient-to-r from-[#0A0A0A] to-gray-400 bg-clip-text text-transparent">VexCoding</span> constrói operações digitais que crescem com você.
        </h1>
      </FadeUp>
      <FadeUp delay={0.15}>
        <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-gray-500 md:text-xl">
          Sites, sistemas e estruturas digitais criadas para gerar clareza, organização e resultado. Visual premium, base moderna e operação pronta para escalar.
        </p>
      </FadeUp>
      <FadeUp delay={0.25} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href="#portfolio"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-8 py-4 font-medium text-white shadow-lg shadow-gray-200 transition hover:scale-[1.02] hover:bg-gray-900 sm:w-auto"
        >
          Ver soluções <ArrowRight size={18} />
        </a>
        <a
          href="#contato"
          className="flex w-full items-center justify-center rounded-xl border border-[#0A0A0A] bg-white px-8 py-4 font-medium text-[#0A0A0A] transition hover:scale-[1.02] hover:bg-gray-50 sm:w-auto"
        >
          Falar com a gente
        </a>
      </FadeUp>
    </div>
  </section>
);

export const Services = () => {
  const services = [
    {
      icon: <Globe size={30} strokeWidth={1.7} />,
      title: 'Sites e landing pages',
      description: 'Estruturas comerciais com narrativa forte, carregamento rápido e base pronta para conversão.',
    },
    {
      icon: <Wrench size={30} strokeWidth={1.7} />,
      title: 'Sistemas sob medida',
      description: 'Ferramentas internas, painéis, áreas autenticadas e operações digitais desenhadas para o seu fluxo.',
    },
    {
      icon: <ShoppingCart size={30} strokeWidth={1.7} />,
      title: 'Experiencias de venda',
      description: 'Lojas, funis e jornadas digitais que organizam produto, atendimento e decisao de compra.',
    },
  ];

  return (
    <section id="servicos" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <FadeUp>
          <SectionHeading
            eyebrow="O que fazemos"
            title={
              <>
                Soluções em código,
                <br />
                foco real no negocio.
              </>
            }
          />
        </FadeUp>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {services.map((service, index) => (
            <FadeUp key={service.title} delay={index * 0.08}>
              <Card className="h-full rounded-[32px] p-8 transition duration-300 hover:-translate-y-1 hover:border-gray-200">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F5F5] text-[#0A0A0A]">
                  {service.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-[#0A0A0A]">{service.title}</h3>
                <p className="leading-relaxed text-gray-500">{service.description}</p>
              </Card>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Portfolio = () => (
  <section id="portfolio" className="bg-[#F5F5F5] py-24 md:py-32">
    <div className="mx-auto max-w-7xl px-6 md:px-12">
      <FadeUp>
        <SectionHeading
          eyebrow="Soluções"
          title="Estruturas digitais pensadas para operar"
          description="Apresentamos capacidades e frentes de trabalho da VexCoding. Projetos e resultados serão publicados somente quando houver autorização dos clientes."
          actions={
            <a href="#portfolio-grid" className="inline-flex items-center gap-2 text-sm font-medium text-[#0A0A0A] transition hover:text-gray-600">
              Falar sobre uma solução <ArrowRight size={16} />
            </a>
          }
        />
      </FadeUp>
      <div id="portfolio-grid" className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        {[
          ['Sites e landing pages', 'Páginas rápidas, claras e orientadas à conversão, com captação conectada.'],
          ['Sistemas internos e SaaS', 'Produtos sob medida para organizar processos, dados, permissões e decisões.'],
          ['Portais autenticados', 'Áreas para clientes com etapas, documentos, mensagens e checklists seguros.'],
          ['Automação e integrações', 'Conexões entre ferramentas, APIs e rotinas para reduzir trabalho manual.'],
        ].map(([title, description], index) => (
          <FadeUp key={title} delay={index * 0.08}>
            <Card className="h-full rounded-[32px] p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">0{index + 1}</p>
              <h3 className="mt-5 text-xl font-semibold text-[#0A0A0A]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">{description}</p>
            </Card>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);

export const Differentials = () => {
  const items = [
    {
      icon: <CheckCircle2 size={22} />,
      title: 'Entrega com clareza',
      desc: 'Cronograma, próximo passo e responsável visíveis para você acompanhar sem ruído.',
    },
    {
      icon: <MessageSquare size={22} />,
      title: 'Comunicação direta',
      desc: 'Sem labirinto técnico. Você sabe o que está sendo feito e por que aquilo importa.',
    },
    {
      icon: <Wrench size={22} />,
      title: 'Base pronta para operar',
      desc: 'Não entregamos só tela bonita. Entregamos processo, integração e manutenção simples.',
    },
    {
      icon: <CircleDollarSign size={22} />,
      title: 'Visão de negócio',
      desc: 'Design, código e decisão caminhando juntos para gerar retorno real.',
    },
  ];

  return (
    <section id="diferenciais" className="border-t border-gray-100 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 md:px-12 lg:grid-cols-3">
        <FadeUp className="lg:col-span-1">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gray-400">Por que a VexCoding</p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-4xl">
            Diferente do mercado que entrega bonito e desaparece.
          </h2>
          <p className="mt-6 max-w-md text-gray-500">
            Nosso trabalho une design limpo, estrutura comercial e operação interna. O objetivo não é impressionar só na primeira dobra. É fazer o negócio funcionar.
          </p>
        </FadeUp>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:col-span-2">
          {items.map((item, index) => (
            <FadeUp key={item.title} delay={index * 0.08}>
              <div className="flex gap-4">
                <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F5F5] text-[#0A0A0A]">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0A0A0A]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Testimonials = () => {
  const items = [
    ['Diagnóstico', 'Entendemos o processo, os usuários e o resultado esperado antes de escolher a tecnologia.'],
    ['Construção', 'Desenhamos a experiência, implementamos a base e conectamos as operações necessárias.'],
    ['Validação', 'Testamos os fluxos principais, ajustamos com você e preparamos a entrega para o uso real.'],
    ['Evolução', 'Documentamos o que foi construído e deixamos um caminho claro para manutenção.'],
  ];

  return (
    <section className="bg-[#F5F5F5] py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <FadeUp>
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-4xl">
            Como conduzimos cada projeto
          </h2>
        </FadeUp>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {items.map(([title, description], index) => (
            <FadeUp key={title} delay={index * 0.08}>
              <Card className="relative rounded-[32px] p-8 md:p-10">
                <div className="absolute left-6 top-6 text-[#0A0A0A]/10">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="relative z-10 pt-4 text-lg font-semibold text-[#0A0A0A]">{title}</p>
                <p className="mt-4 text-sm leading-7 text-gray-500">{description}</p>
              </Card>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
};

export const CTAFinal = () => (
  <section className="bg-[#0A0A0A] px-6 py-28 text-center">
    <div className="mx-auto max-w-3xl">
      <FadeUp>
        <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Pronto para transformar sua ideia em um sistema de verdade?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          O site apresenta a proposta, a captação organiza as oportunidades e a área interna dá visibilidade ao fluxo. O próximo passo é construir a solução certa para o seu negócio.
        </p>
        <a
          href="#contato"
          className="mt-10 inline-flex items-center rounded-xl bg-white px-8 py-4 font-bold text-[#0A0A0A] transition hover:scale-[1.02] hover:bg-gray-100"
        >
          Solicitar orçamento agora
        </a>
      </FadeUp>
    </div>
  </section>
);

export const Contact = () => {
  const [formData, setFormData] = useState(createContactForm());
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) return undefined;

    const renderWidget = () => {
      const container = document.getElementById('vexcoding-turnstile');
      if (!container || !window.turnstile || container.dataset.rendered === 'true') return;
      window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      });
      container.dataset.rendered = 'true';
    };

    const existingScript = document.querySelector('script[data-turnstile]');
    if (existingScript) {
      renderWidget();
      return undefined;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.addEventListener('load', renderWidget);
    document.head.appendChild(script);

    return () => script.removeEventListener('load', renderWidget);
  }, []);

  const handleChange = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/public/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          projectType: formData.project_type,
          message: formData.message,
          turnstileToken,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Não foi possível enviar seu contato agora.');
      }

      setFormData(createContactForm());
      setTurnstileToken('');
      setStatus('success');
      setMessage('Mensagem enviada. Ela já está pronta para aparecer na área interna dos sócios.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Não foi possível enviar seu contato agora.');
    }
  };

  return (
    <section id="contato" className="bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 md:px-12 lg:grid-cols-2">
        <FadeUp>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gray-400">Contato</p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">Vamos conversar.</h2>
          <p className="mt-6 max-w-xl text-lg text-gray-500">
             Preencha o formulário e sua mensagem entra direto no painel interno da VexCoding para qualificação, proposta e transformação em projeto.
          </p>
          <div className="mt-8 space-y-4 text-gray-600">
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <span>contato@vexcoding.com</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} />
              <span>Atendimento organizado, seguro e pronto para escalar no Supabase.</span>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <Card className="rounded-[32px] p-7 md:p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Nome completo">
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    className={inputClassName}
                    placeholder="Seu nome"
                  />
                </Field>
                <Field label="E-mail">
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className={inputClassName}
                    placeholder="voce@empresa.com"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Empresa">
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(event) => handleChange('company', event.target.value)}
                    className={inputClassName}
                    placeholder="Nome da empresa"
                  />
                </Field>
                <Field label="Tipo de projeto">
                  <select
                    value={formData.project_type}
                    onChange={(event) => handleChange('project_type', event.target.value)}
                    className={inputClassName}
                  >
                    {serviceTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Detalhes do projeto">
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(event) => handleChange('message', event.target.value)}
                  className={`${inputClassName} resize-none`}
                  placeholder="Fale sobre a ideia, prazo, referências e o que precisa ser construído."
                />
              </Field>
              <div id="vexcoding-turnstile" className="min-h-16" aria-label="Proteção anti-spam" />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="flex w-full items-center justify-center rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'loading' ? 'Enviando...' : 'Enviar mensagem'}
              </button>
              {message ? (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    status === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : status === 'error'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  {message}
                </div>
              ) : null}
            </form>
          </Card>
        </FadeUp>
      </div>
    </section>
  );
};

export const Footer = ({ onOpenLogin, onOpenClientArea, onOpenPolicy }) => (
  <footer className="border-t border-gray-200 bg-[#F5F5F5] pb-8 pt-16">
    <div className="mx-auto max-w-7xl px-6 md:px-12">
      <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <a href="/" className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A0A0A] text-white">
              <Code2 size={18} strokeWidth={2.4} />
            </div>
            <span className="text-xl font-bold text-[#0A0A0A]">VexCoding</span>
          </a>
          <p className="max-w-sm text-sm text-gray-500">
            Desenvolvimento de sites, sistemas e operações digitais com estrutura para vender, entregar e crescer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onOpenLogin}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#0A0A0A] transition hover:border-[#0A0A0A] hover:bg-white"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={onOpenClientArea}
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-[#0A0A0A] transition hover:border-[#0A0A0A] hover:bg-white"
          >
            Área do cliente
          </button>
          <a
            href="https://instagram.com/vexcoding"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://linkedin.com/company/vexcoding"
            target="_blank"
            rel="noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-gray-300 pt-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <p>© 2026 VexCoding. Todos os direitos reservados.</p>
        <div className="flex flex-wrap gap-6">
          <button type="button" onClick={() => onOpenPolicy('terms')} className="transition hover:text-[#0A0A0A]">
            Termos de uso
          </button>
          <button type="button" onClick={() => onOpenPolicy('privacy')} className="transition hover:text-[#0A0A0A]">
            Política de privacidade
          </button>
        </div>
      </div>
    </div>
  </footer>
);

export const PolicyModal = ({ type, onClose }) => {
  const content = {
    terms: {
      title: 'Termos de uso',
      body:
        'Este site apresenta as capacidades da VexCoding e um fluxo comercial conectado ao Supabase. Informações enviadas no formulário são usadas apenas para organização comercial, proposta e atendimento.',
    },
    privacy: {
      title: 'Política de privacidade',
      body:
        'Os dados enviados no formulário ficam armazenados para atendimento comercial e gestão interna. As informações ficam sob a conta Supabase da VexCoding, com políticas de segurança e acesso autenticado para os sócios.',
    },
  }[type];

  if (!content) {
    return null;
  }

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full max-w-2xl rounded-[32px] bg-white p-8"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">Informações legais</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#0A0A0A]">{content.title}</h3>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-[#F5F5F5] p-3 text-[#0A0A0A]">
              <X size={18} />
            </button>
          </div>
          <p className="mt-6 leading-relaxed text-gray-600">{content.body}</p>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export const SiteShell = ({
  onOpenLogin,
  onOpenClientArea,
  policyModal,
  setPolicyModal,
}) => (
  <>
    <Navbar onOpenLogin={onOpenLogin} onOpenClientArea={onOpenClientArea} />
    <main className="antialiased text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-white">
      <Hero />
      <Services />
      <Portfolio />
      <Differentials />
      <Testimonials />
      <CTAFinal />
      <Contact />
    </main>
    <Footer onOpenLogin={onOpenLogin} onOpenClientArea={onOpenClientArea} onOpenPolicy={setPolicyModal} />
    {policyModal ? <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} /> : null}
  </>
);
