HEAD
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0,000000,1a1a1a&height=200&section=header&text=VexCoding&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=Código%20que%20move%20negócios&descAlignY=58&descSize=18&descColor=888888" width="100%"/>

<br/>

</div>



>>>>>>> bca1643 (Initial commit)
# VexCoding Workspace

Base em `Next.js 14 + TypeScript + Tailwind CSS + Supabase`, pronta para deploy na Railway via GitHub.

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Supabase
- Railway

## Rodando localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` com base em `.env.example`.

3. Rode o projeto:

```bash
npm run dev
```

4. Validacoes principais:

```bash
npm run lint
npm run build
```

## Variaveis de ambiente

Preencha no `.env` local e tambem no painel da Railway:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=project-documents
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
SESSION_SECRET=
```

## Login

### Modo demo

Se o Supabase oficial nao estiver configurado corretamente, o sistema usa dados locais com estas credenciais:

- usuario: `rafael` | senha: `123456`
- usuario: `lourenzo` | senha: `123456`

### Modo oficial

No modo oficial, essas mesmas credenciais sao validadas pela tabela `partners` no Supabase. O arquivo `supabase/schema.sql` ja cria os 2 socios com a senha inicial `123456`.

## Supabase

1. Crie um projeto no Supabase.
2. Abra o `SQL Editor`.
3. Execute `supabase/schema.sql`.
4. Confirme o bucket usado em `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`.
5. Copie estas variaveis:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

6. Gere um valor forte para `SESSION_SECRET`.

## Deploy na Railway

1. Envie este projeto para um repositório no GitHub.
2. Na Railway, crie um novo projeto com `Deploy from GitHub repo`.
3. Selecione este repositório.
4. Configure as variaveis de ambiente do projeto com os mesmos valores do `.env`.
5. A Railway vai usar:

- build command: `npm run build`
- start command: `npm run start`

6. Depois do primeiro deploy, abra o dominio gerado pela Railway.

O arquivo `railway.json` ja foi incluido para padronizar esse deploy.

## Estrutura principal

- `src/app/page.tsx`: home publica
- `src/app/login/page.tsx`: login
- `src/app/dashboard/layout.tsx`: shell autenticado
- `src/app/api/workspace/route.ts`: API do modo oficial
- `src/app/api/documents/upload/route.ts`: upload para o Storage
- `src/components/providers/dashboard-provider.tsx`: estado e acoes do painel
- `src/lib/server/workspace-db.ts`: integracao server-side com Supabase
- `src/data/demo.ts`: base demo

## Observacoes importantes

- O modo oficial depende de `SUPABASE_SERVICE_ROLE_KEY`.
- `SESSION_SECRET` precisa ser forte em producao.
- Se alterar variaveis de ambiente, refaça o deploy na Railway.
<<<<<<< HEAD


<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0,1a1a1a,000000&height=120&section=footer&text=VexCoding%20·%202026&fontSize=16&fontColor=555555&fontAlignY=65" width="100%"/>

</div>
