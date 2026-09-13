declare module '@/app/site.jsx' {
  import type { ComponentType } from 'react';
  export const SiteShell: ComponentType<any>;
}
declare module '@/app/shared.jsx' {
  export const useGlobalStyles: () => void;
}
