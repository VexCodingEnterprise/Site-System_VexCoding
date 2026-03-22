import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'VexCoding',
  description: 'VexCoding - sistemas, sites e operacoes digitais.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        style={{
          fontFamily:
            'Inter, Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
