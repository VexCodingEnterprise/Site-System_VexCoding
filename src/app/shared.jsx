/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0A0A0A] outline-none transition focus:border-[#0A0A0A] focus:ring-4 focus:ring-[#0A0A0A]/5';

export const useGlobalStyles = () => {
  useEffect(() => {
    document.body.style.fontFamily =
      'Inter, Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    document.body.style.backgroundColor = '#FFFFFF';
    document.body.style.color = '#0A0A0A';
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);
};

export const FadeUp = ({ children, delay = 0, className = '' }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </MotionDiv>
);

export const StatusBadge = ({ value }) => {
  const tones = {
    Novo: 'bg-slate-100 text-slate-700 border-slate-200',
    Qualificado: 'bg-blue-50 text-blue-700 border-blue-200',
    'Em proposta': 'bg-amber-50 text-amber-700 border-amber-200',
    Fechado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Arquivado: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    Briefing: 'bg-slate-100 text-slate-700 border-slate-200',
    Planejamento: 'bg-violet-50 text-violet-700 border-violet-200',
    'Em andamento': 'bg-blue-50 text-blue-700 border-blue-200',
    'Em aprovacao': 'bg-amber-50 text-amber-700 border-amber-200',
    Concluido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Planejada: 'bg-slate-100 text-slate-700 border-slate-200',
    'Em revisao': 'bg-amber-50 text-amber-700 border-amber-200',
    Concluida: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Backlog: 'bg-slate-100 text-slate-700 border-slate-200',
    Bloqueada: 'bg-rose-50 text-rose-700 border-rose-200',
    Receita: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Despesa: 'bg-rose-50 text-rose-700 border-rose-200',
    Alta: 'bg-rose-50 text-rose-700 border-rose-200',
    Media: 'bg-amber-50 text-amber-700 border-amber-200',
    Baixa: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[value] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
    >
      {value}
    </span>
  );
};

export const SectionHeading = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gray-400">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 max-w-2xl text-base text-gray-500 md:text-lg">{description}</p> : null}
    </div>
    {actions}
  </div>
);

export const Card = ({ children, className = '' }) => (
  <div className={`rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ${className}`}>
    {children}
  </div>
);

export const Field = ({ label, children, hint }) => (
  <label className="block space-y-2">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    {children}
    {hint ? <span className="block text-xs text-gray-400">{hint}</span> : null}
  </label>
);

export const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) {
      return undefined;
    }

    let animationFrameId = 0;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      const total = window.innerWidth < 768 ? 35 : 80;
      particles = Array.from({ length: total }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.4,
        speedY: Math.random() * -0.55 - 0.08,
        opacity: Math.random() * 0.28 + 0.08,
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.y += particle.speedY;
        if (particle.y < 0) {
          particle.y = canvas.height + 4;
          particle.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = `rgba(10, 10, 10, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = window.requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('resize', init);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />;
};
