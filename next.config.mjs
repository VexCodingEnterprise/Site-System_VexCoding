/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    let supabaseOrigin = 'https://*.supabase.co';
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
      }
    } catch {
      // A configuração inválida será reportada pela validação do Supabase.
    }
    const securityHeaders = [
      { key: 'Content-Security-Policy', value: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        `connect-src 'self' ${supabaseOrigin} https://*.supabase.co https://challenges.cloudflare.com wss://*.supabase.co`,
        "frame-src https://challenges.cloudflare.com",
        "upgrade-insecure-requests",
      ].join('; ') },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ];

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' });
    }

    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
