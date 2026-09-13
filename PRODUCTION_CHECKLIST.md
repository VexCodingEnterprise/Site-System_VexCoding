# Checklist de produção

## Código

- [x] Next 16, React 19 e TypeScript compilam.
- [x] Código Vite legado, Netlify e Railway removido.
- [x] `.next` e logs de build removidos do tracking.
- [x] Revisar o conteúdo público; warnings restantes são de hooks/impureza em componentes internos legados.

## Supabase

- [ ] Criar usuários reais dos sócios no Supabase Auth.
- [ ] Inserir/vincular `partners.auth_user_id` sem senha ou hash no banco.
- [ ] Aplicar `supabase/migrations/202609120000_bootstrap.sql` e `202609120001_secure_auth_rls_storage.sql` após revisão e dry-run.
- [ ] Confirmar RLS para parceiro, cliente A, cliente B e anônimo.
- [ ] Confirmar que `project-documents` é privado.
- [ ] Validar signed URLs, upload, exclusão e acesso entre projetos.

## Segurança

- [x] `.env` removido do tracking e `.env.example` criado sem valores.
- [x] Fallback de senha demo e HMAC removidos do login de produção.
- [x] Turnstile é obrigatório em produção e validado no servidor.
- [x] Limite de tipo/tamanho de upload implementado.
- [ ] Rotacionar credenciais antigas conforme `SECURITY_ROTATION.md`.
- [ ] Revisar o histórico Git com os responsáveis e remover segredos antigos após a rotação.

## Cloudflare

- [x] `open-next.config.ts` e `wrangler.jsonc` configurados explicitamente para Workers.
- [x] `npm run build:cloudflare` passou.
- [ ] Executar `npx wrangler login`.
- [ ] Configurar secrets com `npx wrangler secret put`.
- [ ] Publicar em `workers.dev` e executar smoke tests.

## DNS

- [ ] Manter o Netlify antigo como rollback até a validação final.
- [ ] Adicionar o domínio customizado no Worker correto.
- [ ] Conferir DNS/TLS no painel Cloudflare antes da troca.
- [ ] Só remover o rollback depois dos testes públicos e autenticados.

## Testes

- [x] `npm.cmd ci` passou.
- [x] `npm.cmd run test` passou (4 testes de validação).
- [x] `npm.cmd audit --omit=dev --audit-level=high` passou sem vulnerabilidades de produção.
- [x] `npm.cmd run lint` passou sem erros; há warnings de hooks legados.
- [x] `npx.cmd tsc --noEmit` passou.
- [x] `npm.cmd run build` passou.
- [x] `npm.cmd run build:cloudflare` passou.
- [ ] Testar homepage desktop/mobile e formulário com Turnstile real.
- [ ] Testar login/logout/sessão de sócio e cliente.
- [ ] Testar isolamento cliente A/B e Storage privado.

## Pendências externas

- Acesso autenticado ao projeto Supabase para aplicar migration e criar/vincular contas Auth.
- Acesso autenticado à conta Cloudflare para secrets, deploy `workers.dev` e domínio.
- Rotação das credenciais que estiveram no `.env` histórico.
