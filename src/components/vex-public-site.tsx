'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteShell } from '@/app/site.jsx';
import { useGlobalStyles } from '@/app/shared.jsx';

export function VexPublicSite() {
  const router = useRouter();
  const [policyModal, setPolicyModal] = useState<any>(null);

  useGlobalStyles();

  useEffect(() => {
    router.prefetch('/login');
    router.prefetch('/cliente');
  }, [router]);

  return (
    <SiteShell
      onOpenLogin={() => router.push('/login')}
      onOpenClientArea={() => router.push('/cliente')}
      policyModal={policyModal}
      setPolicyModal={setPolicyModal}
    />
  );
}
