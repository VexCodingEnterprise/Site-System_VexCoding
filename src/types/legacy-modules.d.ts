declare module '@/app/site.jsx' {
  import type { ComponentType } from 'react';

  export const SiteShell: ComponentType<any>;
  export const PublicProjectPage: ComponentType<any>;
}

declare module '@/app/shared.jsx' {
  export const useGlobalStyles: () => void;
}

declare module '@/data/mockData.js' {
  export const portfolioProjects: Array<any>;
}
