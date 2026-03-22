import { useEffect, useState } from 'react';
import { authApi } from './lib/dataService';
import { portfolioProjects } from './data/mockData';
import { useGlobalStyles, Card } from './app/shared';
import { SiteShell, PublicProjectPage } from './app/site';
import { PartnerLoginPage } from './app/PartnerLoginPage';
import { WorkspaceApp } from './app/WorkspaceApp';

const resolveRoute = (pathname) => {
  if (pathname.startsWith('/socios/login')) {
    return { name: 'partner-login' };
  }

  if (pathname.startsWith('/socios')) {
    return { name: 'workspace' };
  }

  if (pathname.startsWith('/projetos/')) {
    return {
      name: 'project-detail',
      slug: decodeURIComponent(pathname.replace('/projetos/', '').replace(/\/$/, '')),
    };
  }

  return { name: 'home' };
};

const navigateTo = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default function App() {
  useGlobalStyles();

  const [route, setRoute] = useState(() => resolveRoute(window.location.pathname));
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [policyModal, setPolicyModal] = useState(null);

  useEffect(() => {
    const handleLocation = () => setRoute(resolveRoute(window.location.pathname));
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const currentSession = await authApi.getSession();
        if (isMounted) {
          setSession(currentSession);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    loadSession();

    const { data } = authApi.onAuthStateChange((nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      data?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (route.name === 'project-detail') {
      const project = portfolioProjects.find((item) => item.slug === route.slug);
      document.title = project ? `${project.title} | VexCoding` : 'Projeto | VexCoding';
      return;
    }

    if (route.name === 'partner-login') {
      document.title = 'Area dos socios | VexCoding';
      return;
    }

    if (route.name === 'workspace') {
      document.title = 'Workspace | VexCoding';
      return;
    }

    document.title = 'VexCoding';
  }, [route]);

  if (authLoading && (route.name === 'workspace' || route.name === 'partner-login')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] px-6">
        <Card className="max-w-xl rounded-[32px] p-8 text-center">
          <p className="text-lg font-medium text-[#0A0A0A]">Verificando o acesso dos socios...</p>
          <p className="mt-2 text-sm text-gray-500">Assim que a sessao for validada, o painel sera exibido.</p>
        </Card>
      </div>
    );
  }

  if (route.name === 'partner-login') {
    return <PartnerLoginPage session={session} onLoginSuccess={setSession} navigateTo={navigateTo} />;
  }

  if (route.name === 'workspace') {
    if (!session) {
      return <PartnerLoginPage session={session} onLoginSuccess={setSession} navigateTo={navigateTo} />;
    }

    return <WorkspaceApp session={session} onSessionChange={setSession} navigateTo={navigateTo} />;
  }

  if (route.name === 'project-detail') {
    const project = portfolioProjects.find((item) => item.slug === route.slug);
    return <PublicProjectPage project={project} onBackToSite={() => navigateTo('/')} />;
  }

  return (
    <div className="bg-white text-[#0A0A0A]">
      <SiteShell
        onOpenLogin={() => navigateTo('/socios/login')}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        policyModal={policyModal}
        setPolicyModal={setPolicyModal}
        navigateTo={navigateTo}
      />
    </div>
  );
}
