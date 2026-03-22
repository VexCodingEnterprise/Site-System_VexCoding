import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Code2,
  ExternalLink,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Wrench,
  X,
} from 'lucide-react';
import { portfolioProjects, serviceTypes } from '../data/mockData';
import { getDemoWorkspace, getStoredMode, saveDemoWorkspace } from '../lib/demo-store';
import { createId } from '../lib/utils';
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
    { name: 'Servicos', href: '#servicos' },
    { name: 'Portfolio', href: '#portfolio' },
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
            Area do cliente
          </button>
          <a
            href="#contato"
            className="rounded-xl bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
          >
            Solicitar orcamento
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
                Area do cliente
              </button>
              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-[#0A0A0A] px-4 py-3 text-center text-sm font-medium text-white"
              >
                Solicitar orcamento
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
          A <span className="bg-gradient-to-r from-[#0A0A0A] to-gray-400 bg-clip-text text-transparent">VexCoding</span> construi operacoes digitais que crescem com voce.
        </h1>
      </FadeUp>
      <FadeUp delay={0.15}>
        <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-gray-500 md:text-xl">
          Sites, sistemas e estruturas digitais criadas para gerar clareza, organizacao e resultado. Visual premium, base moderna e operacao pronta para escalar.
        </p>
      </FadeUp>
      <FadeUp delay={0.25} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href="#portfolio"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-8 py-4 font-medium text-white shadow-lg shadow-gray-200 transition hover:scale-[1.02] hover:bg-gray-900 sm:w-auto"
        >
          Ver portfolio <ArrowRight size={18} />
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
      description: 'Estruturas comerciais com narrativa forte, carregamento rapido e base pronta para conversao.',
    },
    {
      icon: <Wrench size={30} strokeWidth={1.7} />,
      title: 'Sistemas sob medida',
      description: 'Ferramentas internas, paineis, areas autenticadas e operacoes digitais desenhadas para o seu fluxo.',
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
                Solucoes em codigo,
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

export const Portfolio = ({ onOpenProject }) => (
  <section id="portfolio" className="bg-[#F5F5F5] py-24 md:py-32">
    <div className="mx-auto max-w-7xl px-6 md:px-12">
      <FadeUp>
        <SectionHeading
          eyebrow="Nossos projetos"
          title="Portfolio exemplo pronto para seus cases reais"
          description="Cada projeto abaixo abre descricao, video e uma pagina exemplo. Assim voce ja publica o site completo agora e depois so troca o conteudo pelos trabalhos reais."
          actions={
            <a href="#portfolio-grid" className="inline-flex items-center gap-2 text-sm font-medium text-[#0A0A0A] transition hover:text-gray-600">
              Ver todos os projetos <ExternalLink size={16} />
            </a>
          }
        />
      </FadeUp>
      <div id="portfolio-grid" className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        {portfolioProjects.map((project, index) => (
          <FadeUp key={project.id} delay={index * 0.08}>
            <button
              type="button"
              onClick={() => onOpenProject(project)}
              className="group w-full text-left"
            >
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[32px] bg-gray-200">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="flex items-center justify-between gap-4 px-1">
                <div>
                  <p className="text-sm text-gray-500">{project.category}</p>
                  <h3 className="mt-1 text-xl font-semibold text-[#0A0A0A]">{project.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-gray-500">{project.shortDescription}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-[#0A0A0A] transition group-hover:border-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white">
                  <ArrowRight size={18} />
                </div>
              </div>
            </button>
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
      desc: 'Cronograma, proximo passo e responsavel visiveis para voce acompanhar sem ruido.',
    },
    {
      icon: <MessageSquare size={22} />,
      title: 'Comunicacao direta',
      desc: 'Sem labirinto tecnico. Voce sabe o que esta sendo feito e porque aquilo importa.',
    },
    {
      icon: <Wrench size={22} />,
      title: 'Base pronta para operar',
      desc: 'Nao entregamos so tela bonita. Entregamos processo, integracao e manutencao simples.',
    },
    {
      icon: <CircleDollarSign size={22} />,
      title: 'Visao de negocio',
      desc: 'Design, codigo e decisao caminhando juntos para gerar retorno real.',
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
            Nosso trabalho une design limpo, estrutura comercial e operacao interna. O objetivo nao e impressionar so na primeira dobra. E fazer o negocio funcionar.
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
    {
      quote:
        'A VexCoding conseguiu traduzir nossa ideia em uma plataforma clara, rapida e muito facil de vender para o cliente final.',
      name: 'Rafael Costa',
      role: 'CEO, TechStart',
    },
    {
      quote:
        'A sensacao foi de ter uma equipe que pensa tanto na tela quanto na operacao. Tudo ficou mais organizado depois da entrega.',
      name: 'Mariana Silva',
      role: 'Diretora de Marketing, Minimal Co.',
    },
  ];

  return (
    <section className="bg-[#F5F5F5] py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <FadeUp>
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-4xl">
            O que nossos clientes percebem no projeto
          </h2>
        </FadeUp>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          {items.map((item, index) => (
            <FadeUp key={item.name} delay={index * 0.08}>
              <Card className="relative rounded-[32px] p-8 md:p-10">
                <div className="absolute left-6 top-6 text-[#0A0A0A]/10">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="relative z-10 pt-4 text-lg italic leading-relaxed text-gray-700">"{item.quote}"</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0A0A0A]">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.role}</p>
                  </div>
                </div>
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
          A landing ja vende, o portfolio ja prova e a area interna ja organiza o fluxo. Agora e so colocar seus projetos reais em cima dessa estrutura.
        </p>
        <a
          href="#contato"
          className="mt-10 inline-flex items-center rounded-xl bg-white px-8 py-4 font-bold text-[#0A0A0A] transition hover:scale-[1.02] hover:bg-gray-100"
        >
          Solicitar orcamento agora
        </a>
      </FadeUp>
    </div>
  </section>
);

export const Contact = () => {
  const [formData, setFormData] = useState(createContactForm());
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleChange = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      if (getStoredMode() === 'official') {
        const response = await fetch('/api/public/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            projectType: formData.project_type,
            message: formData.message,
          }),
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || 'Nao foi possivel enviar seu contato agora.');
        }
      } else {
        const database = getDemoWorkspace();
        database.leads.unshift({
          id: createId('lead'),
          name: formData.name,
          email: formData.email,
          projectType: formData.project_type,
          message: formData.message,
          status: 'Novo',
          createdAt: new Date().toISOString(),
          convertedAt: null,
          projectId: null,
        });
        saveDemoWorkspace(database);
      }

      setFormData(createContactForm());
      setStatus('success');
      setMessage('Mensagem enviada. Ela ja esta pronta para aparecer na area interna dos socios.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Nao foi possivel enviar seu contato agora.');
    }
  };

  return (
    <section id="contato" className="bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 md:px-12 lg:grid-cols-2">
        <FadeUp>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gray-400">Contato</p>
          <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">Vamos conversar.</h2>
          <p className="mt-6 max-w-xl text-lg text-gray-500">
            Preencha o formulario e sua mensagem entra direto no painel interno da VexCoding para qualificacao, proposta e transformacao em projeto.
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
                  placeholder="Fale sobre a ideia, prazo, referencias e o que precisa ser construido."
                />
              </Field>
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
            Desenvolvimento de sites, sistemas e operacoes digitais com estrutura para vender, entregar e crescer.
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
            Area do cliente
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
            Politica de privacidade
          </button>
        </div>
      </div>
    </div>
  </footer>
);

export const ProjectModal = ({ project, onClose, navigateTo }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!project) {
    return null;
  }

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <MotionDiv
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[36px] bg-white"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative aspect-[16/8] overflow-hidden rounded-t-[36px] bg-gray-200">
            <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#0A0A0A] shadow-lg"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">{project.category}</p>
              <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#0A0A0A]">{project.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-gray-600">{project.fullDescription}</p>

              <div className="mt-8 overflow-hidden rounded-[28px] border border-gray-100 bg-[#0A0A0A]">
                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-sm font-medium text-white">
                  <PlayCircle size={16} />
                  Video demonstrativo
                </div>
                <video src={project.videoUrl} controls className="aspect-video w-full bg-black" />
              </div>
            </div>

            <div className="space-y-5">
              <Card className="rounded-[28px]">
                <p className="text-sm font-semibold text-[#0A0A0A]">Resumo rapido</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{project.shortDescription}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span key={item} className="rounded-full bg-[#F5F5F5] px-3 py-1.5 text-xs font-medium text-gray-600">
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
              <Card className="rounded-[28px]">
                <p className="text-sm font-semibold text-[#0A0A0A]">Impactos exibidos</p>
                <div className="mt-4 space-y-3">
                  {project.metrics.map((metric) => (
                    <div key={metric} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="mt-0.5 text-[#0A0A0A]" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <button
                type="button"
                onClick={() => navigateTo(`/projetos/${project.slug}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] px-6 py-4 font-medium text-white transition hover:bg-gray-900"
              >
                {project.linkLabel} <ExternalLink size={17} />
              </button>
            </div>
          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  );
};

export const PolicyModal = ({ type, onClose }) => {
  const content = {
    terms: {
      title: 'Termos de uso',
      body:
        'Este site apresenta projetos demonstrativos da VexCoding e um fluxo comercial conectado ao Supabase. Informacoes enviadas no formulario sao usadas apenas para organizacao comercial, proposta e atendimento.',
    },
    privacy: {
      title: 'Politica de privacidade',
      body:
        'Os dados enviados no formulario ficam armazenados para atendimento comercial e gestao interna. Quando o Supabase estiver configurado, as informacoes ficam sob sua conta, com politicas de seguranca e acesso autenticado para os socios.',
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
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">Informacoes legais</p>
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
  selectedProject,
  setSelectedProject,
  policyModal,
  setPolicyModal,
  navigateTo,
}) => (
  <>
    <Navbar onOpenLogin={onOpenLogin} onOpenClientArea={onOpenClientArea} />
    <main className="antialiased text-[#0A0A0A] selection:bg-[#0A0A0A] selection:text-white">
      <Hero />
      <Services />
      <Portfolio onOpenProject={setSelectedProject} />
      <Differentials />
      <Testimonials />
      <CTAFinal />
      <Contact />
    </main>
    <Footer onOpenLogin={onOpenLogin} onOpenClientArea={onOpenClientArea} onOpenPolicy={setPolicyModal} />
    {selectedProject ? (
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} navigateTo={navigateTo} />
    ) : null}
    {policyModal ? <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} /> : null}
  </>
);

export const PublicProjectPage = ({ project, onBackToSite }) => {
  if (!project) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#0A0A0A]"
          >
            <ArrowLeft size={16} /> Voltar ao site
          </button>
          <Card className="mt-10 rounded-[32px] p-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Projeto nao encontrado</h1>
            <p className="mt-4 text-gray-500">Esse slug ainda nao esta cadastrado no portfolio exemplo.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#0A0A0A] shadow-sm"
        >
          <ArrowLeft size={16} /> Voltar ao site
        </button>

        <div className="mt-8 overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-400">{project.category}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">{project.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">{project.fullDescription}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {project.stack.map((item) => (
                  <span key={item} className="rounded-full bg-[#F5F5F5] px-4 py-2 text-sm font-medium text-gray-600">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {project.metrics.map((metric) => (
                  <Card key={metric} className="rounded-[24px] bg-[#FAFAFA]">
                    <p className="text-sm leading-relaxed text-gray-600">{metric}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="overflow-hidden rounded-[28px] border border-gray-100">
                <img src={project.image} alt={project.title} className="aspect-[4/3] w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-[28px] border border-gray-100 bg-[#0A0A0A]">
                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 text-sm font-medium text-white">
                  <PlayCircle size={16} />
                  Video do projeto
                </div>
                <video src={project.videoUrl} controls className="aspect-video w-full bg-black" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row">
          <button
            type="button"
            onClick={onBackToSite}
            className="rounded-xl border border-gray-200 bg-white px-6 py-4 font-medium text-[#0A0A0A] transition hover:border-[#0A0A0A]"
          >
            Ver mais projetos
          </button>
          <a
            href="/#contato"
            className="rounded-xl bg-[#0A0A0A] px-6 py-4 text-center font-medium text-white transition hover:bg-gray-900"
          >
            Quero um projeto nesse nivel
          </a>
        </div>
      </div>
    </div>
  );
};
