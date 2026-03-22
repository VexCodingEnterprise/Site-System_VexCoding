'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  SquareCheckBig,
  SunMedium,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { useDashboard } from '@/components/providers/dashboard-provider';

const items = [
  { href: '/dashboard', label: 'Visao Geral', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/projetos', label: 'Projetos', icon: FolderKanban },
  { href: '/dashboard/tarefas', label: 'Tarefas', icon: SquareCheckBig },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: WalletCards },
  { href: '/dashboard/concluidos', label: 'Projetos Concluidos', icon: BriefcaseBusiness },
  { href: '/dashboard/configuracoes', label: 'Configuracoes', icon: Settings },
];

const titles: Record<string, string> = {
  '/dashboard': 'Visao Geral',
  '/dashboard/leads': 'Leads',
  '/dashboard/projetos': 'Projetos',
  '/dashboard/tarefas': 'Tarefas',
  '/dashboard/financeiro': 'Financeiro',
  '/dashboard/concluidos': 'Projetos Concluidos',
  '/dashboard/configuracoes': 'Configuracoes',
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { session, mode, setMode, resetDemo, notice, error } = useDashboard();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTitle = pathname.startsWith('/dashboard/projetos/') ? 'Projeto' : titles[pathname] || 'Dashboard';

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-[var(--line)] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-[var(--text)] text-[var(--bg)]">
            VC
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text)]">VexCoding</p>
              <p className="truncate text-xs muted">Area dos socios</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-11 items-center gap-3 border border-transparent px-3 text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--panel-alt)] text-[var(--text)] border-[var(--line)]'
                    : 'text-[var(--muted)] hover:bg-[var(--panel-alt)] hover:text-[var(--text)]',
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--line)] p-3">
        <div className="flex items-center gap-3 border border-[var(--line)] bg-[var(--panel-alt)] px-3 py-3">
          <div
            className="flex h-9 w-9 items-center justify-center text-sm font-semibold text-white"
            style={{ background: session.avatarColor }}
          >
            {getInitials(session.displayName)}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text)]">{session.displayName}</p>
              <p className="truncate text-xs muted">{session.role}</p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
          }}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 border border-[var(--line)] bg-[var(--panel)] text-sm font-medium text-[var(--text)] transition hover:bg-[var(--panel-alt)]"
        >
          <LogOut size={16} />
          {!collapsed ? 'Sair' : null}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'hidden shrink-0 border-r border-[var(--line)] bg-[var(--panel)] transition-[width] duration-200 md:block',
            collapsed ? 'w-[74px]' : 'w-[260px]',
          )}
        >
          {SidebarContent}
        </aside>

        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.2 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[var(--line)] bg-[var(--panel)] md:hidden"
              >
                {SidebarContent}
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          {mode === 'demo' ? (
            <div className="flex flex-col gap-3 border-b border-yellow-300 bg-yellow-200/90 px-4 py-3 text-sm text-yellow-950 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">MODO DEMO</span>
                <span>Dados ficticios pre-carregados para navegar, testar e apresentar.</span>
              </div>
              <button
                type="button"
                onClick={resetDemo}
                className="h-9 border border-yellow-800/20 bg-yellow-50 px-3 text-sm font-medium text-yellow-950"
              >
                Resetar dados demo
              </button>
            </div>
          ) : null}

          <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color:var(--bg)]/92 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--panel)] md:hidden"
                >
                  <Menu size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setCollapsed((value) => !value)}
                  className="hidden h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--panel)] md:flex"
                >
                  {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{activeTitle}</p>
                  <p className="truncate text-xs muted">{pathname}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--panel)]"
                >
                  {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => void setMode(mode === 'demo' ? 'official' : 'demo')}
                  className={cn(
                    'h-10 border px-3 text-sm font-medium',
                    mode === 'demo'
                      ? 'border-yellow-400 bg-yellow-100 text-yellow-950'
                      : 'border-[var(--line)] bg-[var(--panel)] text-[var(--text)]',
                  )}
                >
                  {mode === 'demo' ? 'MODO DEMO' : 'MODO OFICIAL'}
                </button>
                <div className="hidden items-center gap-3 border border-[var(--line)] bg-[var(--panel)] px-3 py-2 md:flex">
                  <div
                    className="flex h-8 w-8 items-center justify-center text-xs font-semibold text-white"
                    style={{ background: session.avatarColor }}
                  >
                    {getInitials(session.displayName)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{session.displayName}</p>
                    <p className="truncate text-xs muted">@{session.username}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen((value) => !value)}
                  className="flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--panel)] md:hidden"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </header>

          {(notice || error) && (
            <div
              className={cn(
                'border-b px-4 py-3 text-sm md:px-6',
                error
                  ? 'border-red-300 bg-red-100 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
                  : 'border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
              )}
            >
              {error || notice}
            </div>
          )}

          <main className="px-4 py-4 md:px-6 md:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
