# Migração de produção da VexCoding

Última atualização: 2026-09-13
Branch de trabalho: `codex/vexcoding-production-hardening`

## Estado

- [x] Auditoria inicial e branch de trabalho criada a partir de `main`.
- [x] Dependências alinhadas para Node `>=22 <25`, Next 16.3.5, React 19 e OpenNext.
- [x] Baseline e regressão local: lint, TypeScript, build Next, build OpenNext e testes Vitest.
- [x] `.env`, `.next`, `tsconfig.tsbuildinfo`, logs e configurações legadas removidos do tracking; `.env.example` criado sem valores.
- [x] Login de sócios e clientes migrado para Supabase Auth com sessão SSR; fallback HMAC e senhas demo removidos.
- [x] Endpoint público de lead protegido por validação, limite de payload e Turnstile server-side.
- [x] Uploads limitados por MIME/tamanho, com bucket privado, caminhos por projeto e signed URLs.
- [x] Bootstrap não destrutivo versionado em `202609120000_bootstrap.sql` e migration incremental de RLS, Auth e Storage documentados.
- [x] Configuração OpenNext/Cloudflare Workers criada sem Docker, Netlify ou Railway.
- [x] Conteúdo público fictício removido; interface pública revisada para pt-BR e capacidades verificáveis.
- [x] README, checklist de produção e rotação de credenciais atualizados.
- [ ] Aplicar migration e validar isolamento no Supabase remoto.
- [ ] Publicar no Cloudflare, configurar secrets, domínio e executar smoke tests autenticados.

## Bloqueios externos conhecidos

- Deploy e configuração remota do Supabase/Cloudflare dependem de autenticação e acesso às contas; nenhum segredo será solicitado ou registrado neste arquivo.
- A migration interrompe de forma segura se encontrar parceiros sem `auth_user_id` antes de remover `password_hash` legado.

## Testes executados

- `npm.cmd ci` — passou; a instalação reportou vulnerabilidades no conjunto completo, mas `npm.cmd audit --omit=dev --audit-level=high` terminou com 0 vulnerabilidades de produção após a atualização direcionada de `baseline-browser-mapping`.
- `npm.cmd run test` — 4 testes passaram.
- `npm.cmd run lint` — passou sem erros; restam warnings de hooks/impureza em componentes legados.
- `npx.cmd tsc --noEmit` — passou.
- `npm.cmd run build` — passou.
- `npm.cmd run build:cloudflare` — passou; gerou `.open-next/worker.js`.
- `npm ci` — bloqueado pela política de execução do PowerShell; equivalente `npm.cmd ci` foi usado.

## Problemas encontrados

- O histórico Git pode conter segredos antigos; a rotação e eventual limpeza com `git filter-repo`/BFG exigem autorização dos responsáveis.
- A validação funcional com usuários, RLS, signed URLs e Storage ainda precisa ser executada no Supabase remoto.
