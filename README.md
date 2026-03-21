# VexCoding Workspace

Base em `Next.js 14 + TypeScript + Tailwind CSS + Framer Motion + Supabase`, pronta para deploy na Netlify.

O projeto entrega:

- site publico com CTA para `Area dos socios`
- login fixo para os 2 socios
- dashboard interno com leads, projetos, tarefas, financeiro, concluidos e configuracoes
- modo demo com dados locais
- modo oficial com Supabase em tempo real
- upload de documentos para o Supabase Storage

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Supabase
- Netlify

## Rodando localmente

1. Instale as dependencias:

```bash
npm install
```

2. Copie `.env.example` para `.env.local`.

3. Preencha as variaveis:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=project-documents
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
SESSION_SECRET=
```

4. Rode o projeto:

```bash
npm run dev
```

5. Validacoes principais:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Login

### Modo demo

Se o Supabase oficial nao estiver configurado, o sistema usa dados locais com estas credenciais:

- usuario: `rafael` | senha: `123456`
- usuario: `lourenzo` | senha: `123456`

### Modo oficial

No modo oficial, essas mesmas credenciais sao validadas pela tabela `partners` no Supabase. O arquivo [supabase/schema.sql](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/supabase/schema.sql) ja cria os 2 socios com a senha `123456`.

## Supabase

1. Crie um projeto novo no Supabase.
2. Abra `SQL Editor`.
3. Execute o arquivo [supabase/schema.sql](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/supabase/schema.sql).
4. Confirme que o bucket `project-documents` foi criado.
5. Copie as variaveis do painel:

- `NEXT_PUBLIC_SUPABASE_URL`: `Settings > API > Project URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `Settings > API > anon public key`
- `SUPABASE_SERVICE_ROLE_KEY`: `Settings > API > service_role`

6. Gere um segredo para sessao. Exemplo:

```bash
openssl rand -hex 32
```

Use esse valor em `SESSION_SECRET`.

7. Se quiser integrar usuarios reais do Supabase Auth mais tarde, voce pode criar os usuarios em `Authentication > Users` e preencher manualmente o campo `auth_user_id` na tabela `partners`. O fluxo atual nao depende disso para funcionar.

## Resend

- `RESEND_API_KEY`: painel do Resend em `API Keys`

Hoje a chave fica preparada nas configuracoes do sistema. O envio em si pode ser ligado depois sem mexer na base estrutural.

## Netlify

O projeto ja esta preparado com [netlify.toml](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/netlify.toml) e `@netlify/plugin-nextjs`.

### Build

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Variaveis de ambiente na Netlify

Em `Site settings > Environment variables`, adicione:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `SESSION_SECRET`

## Como o sistema funciona

### Demo

- usa `localStorage`
- mostra banner amarelo
- permite resetar a base demo
- mantem dados ficticios para apresentar o painel

### Oficial

- carrega leads, projetos, tarefas, financeiro e documentos do Supabase
- grava alteracoes pelas rotas internas do Next
- faz upload de documentos para o Storage
- mantem sessao persistente por cookie assinado

## Estrutura principal

- [src/app/page.tsx](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/src/app/page.tsx): home publica
- [src/app/login/page.tsx](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/src/app/login/page.tsx): login
- [src/app/dashboard/layout.tsx](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/src/app/dashboard/layout.tsx): shell autenticado
- [src/app/api/workspace/route.ts](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/src/app/api/workspace/route.ts): API do modo oficial
- [src/app/api/documents/upload/route.ts](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/src/app/api/documents/upload/route.ts): upload para o Storage
- [src/components/providers/dashboard-provider.tsx](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/src/components/providers/dashboard-provider.tsx): estado e acoes do painel
- [src/lib/server/workspace-db.ts](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/src/lib/server/workspace-db.ts): integracao server-side com Supabase
- [src/data/demo.ts](/c:/Users/rafin/Desktop/VexCoding/vexcoding-site/src/data/demo.ts): base demo

## Observacoes importantes

- O modo oficial depende de `SUPABASE_SERVICE_ROLE_KEY` porque o app usa rotas server-side para escrita segura e upload de documentos.
- O `SESSION_SECRET` e obrigatorio em producao para proteger o cookie da area interna.
- O primeiro `next build` no Windows pode demorar alguns minutos por causa da compilacao completa do app.
