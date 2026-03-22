'use client';

import { useRouter } from 'next/navigation';
import { PublicProjectPage } from '@/app/site.jsx';
import { useGlobalStyles } from '@/app/shared.jsx';
import { portfolioProjects } from '@/data/mockData.js';

export function VexPublicProject({ slug }: { slug: string }) {
  const router = useRouter();
  const project = portfolioProjects.find((item) => item.slug === slug) || null;

  useGlobalStyles();

  return <PublicProjectPage project={project} onBackToSite={() => router.push('/')} />;
}
