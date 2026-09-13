# VexCoding Platform

Plataforma oficial da VexCoding: site comercial, captação de leads, workspace interno, CRM de projetos e portal autenticado de clientes.

## Stack

- Next.js 16 + React 19 + TypeScript
- Supabase hospedado: Auth, Postgres, RLS e Storage privado
- OpenNext + Cloudflare Workers
- Tailwind CSS, Framer Motion, Recharts e Lucide

## Desenvolvimento local sem Docker

Requisitos: Node.js `>=22` e npm. Este projeto não usa Docker, `supabase start`, banco local ou containers.

```bash
npm install
# PowerShell: Copy-Item .env.example .env.local
# macOS/Linux: cp .env.example .env.local
npm run dev
```

Validações:

```bash
npm run lint
npm run test
npx tsc --noEmit
npm run build
npm run build:cloudflare
```

O modo demo permanece disponível apenas quando `NODE_ENV` não é produção e `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`. Ele nunca é ativado automaticamente quando o Supabase falha.

## Variáveis de ambiente

Use [.env.example](.env.example) como referência. Chaves públicas podem estar no bundle; chaves server-side devem ser configuradas como secrets no ambiente de execução.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `SUPABASE_SECRET_KEY` — somente server-side
- `TURNSTILE_SECRET_KEY` — somente server-side

Não versione `.env`, `.env.local`, `.dev.vars` ou qualquer arquivo com secrets.

## Supabase remoto

1. Crie ou selecione o projeto hospedado no Supabase.
2. Crie os usuários de parceiros em Supabase Auth.
3. Crie as linhas correspondentes em `partners`, preenchendo `auth_user_id` com o UUID do usuário.
4. Faça login e vincule a CLI ao projeto remoto: `npx supabase login` e `npx supabase link --project-ref <PROJECT_REF>`.
5. Revise e simule as migrations — primeiro `202609120000_bootstrap.sql`, depois `202609120001_secure_auth_rls_storage.sql` — com `npx supabase db push --dry-run`; só depois aplique com `npx supabase db push`.
6. Nunca execute um script com `DROP TABLE ... CASCADE` em produção e nunca use `supabase db reset --linked`.
7. Confirme que o bucket `project-documents` é privado.

O arquivo `supabase/schema.sql` é um bootstrap não destrutivo. Mudanças posteriores devem ser migrations incrementais.

## Autenticação e autorização

- Sócios e clientes usam Supabase Auth.
- O servidor valida a sessão e o vínculo do usuário antes de operar.
- O banco usa RLS para separar parceiros, clientes e projetos.
- Documentos usam signed URLs e caminhos `projects/<project_id>/...`.
- Credenciais antigas devem ser rotacionadas conforme [SECURITY_ROTATION.md](SECURITY_ROTATION.md).

## Cloudflare Workers

O setup explícito do OpenNext está em `open-next.config.ts` e `wrangler.jsonc`.

```bash
npm run dev
npm run build:cloudflare
npm run preview:cloudflare
npm run deploy:cloudflare
```

Antes do primeiro deploy, faça login no Wrangler e configure secrets sem incluí-los em comandos versionados:

```bash
npx wrangler login
npx wrangler secret put SUPABASE_SECRET_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Configure também como Variables públicas do Worker (ou no ambiente de build) `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` e `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Não coloque valores reais no `wrangler.jsonc` versionado.

O deploy de produção e o domínio customizado dependem da conta Cloudflare e devem ser validados em uma URL `workers.dev` antes da troca de DNS.

## Estrutura principal

- `src/app/`: páginas, layouts e route handlers
- `src/components/`: interface pública, dashboard e portal do cliente
- `src/lib/server/`: autenticação, validação, Supabase server-side e operações do workspace
- `supabase/migrations/`: alterações incrementais de banco, RLS e Storage
- `open-next.config.ts` e `wrangler.jsonc`: build/deploy OpenNext para Workers
- `MIGRATION_PROGRESS.md`: checkpoint da migração
- `PRODUCTION_CHECKLIST.md`: validação final

## Estado operacional

O build Next e o build OpenNext são executáveis localmente. A validação de login real, migrations remotas, secrets, deploy e DNS depende de acesso às contas Supabase e Cloudflare; esses passos estão documentados no checklist.
