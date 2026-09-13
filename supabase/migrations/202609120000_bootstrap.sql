create extension if not exists pgcrypto;

-- Bootstrap não destrutivo para um projeto novo ou existente.
-- Para produção, aplique as migrations em supabase/migrations/ com dry-run.

create table if not exists public.partners (
  username text primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  display_name text not null,
  role text not null,
  email text not null unique,
  avatar_color text not null default '#0A0A0A',
  notifications_email boolean not null default true,
  notifications_browser boolean not null default true,
  theme_preference text not null default 'system'
    check (theme_preference in ('light', 'dark', 'system')),
  criado_em timestamptz not null default now()
);

create table if not exists public.workspace_settings (
  id text primary key default 'workspace-settings',
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  nome text not null,
  cliente_nome text not null,
  cliente_email text not null,
  empresa text not null default '',
  tipo text not null,
  descricao text not null,
  valor_total numeric(12, 2) not null default 0,
  valor_recebido numeric(12, 2) not null default 0,
  prazo date not null,
  status text not null
    check (status in ('Briefing', 'Execucao', 'Em aprovacao', 'Concluido', 'Pausado')),
  socios_ids text[] not null default '{}'::text[],
  criado_em timestamptz not null default now(),
  concluido_em timestamptz,
  depoimento text,
  usar_como_case boolean not null default false
);

create table if not exists public.leads (
  id text primary key,
  nome text not null,
  email text not null,
  empresa text not null default '',
  tipo_projeto text not null,
  mensagem text not null,
  status text not null default 'Novo'
    check (status in ('Novo', 'Qualificado', 'Em proposta', 'Fechado', 'Convertido')),
  criado_em timestamptz not null default now(),
  convertido_em timestamptz,
  projeto_id text references public.projects(id) on delete set null
);

create table if not exists public.project_status_history (
  id text primary key,
  projeto_id text not null references public.projects(id) on delete cascade,
  status text not null
    check (status in ('Briefing', 'Execucao', 'Em aprovacao', 'Concluido', 'Pausado')),
  alterado_em timestamptz not null default now(),
  alterado_por text not null references public.partners(username) on delete restrict
);

create table if not exists public.ramificacoes (
  id text primary key,
  projeto_id text not null references public.projects(id) on delete cascade,
  nome text not null,
  ordem integer not null default 0
);

create table if not exists public.tarefas (
  id text primary key,
  ramificacao_id text not null references public.ramificacoes(id) on delete cascade,
  projeto_id text not null references public.projects(id) on delete cascade,
  titulo text not null,
  descricao text not null default '',
  responsavel_id text not null references public.partners(username) on delete restrict,
  prazo date not null,
  prioridade text not null check (prioridade in ('Alta', 'Media', 'Baixa')),
  status text not null check (status in ('Backlog', 'Em andamento', 'Bloqueado', 'Concluido')),
  criado_em timestamptz not null default now()
);

create table if not exists public.financeiro (
  id text primary key,
  projeto_id text references public.projects(id) on delete set null,
  descricao text not null,
  valor numeric(12, 2) not null default 0,
  tipo text not null check (tipo in ('Entrada', 'Saldo', 'Despesa')),
  status text not null check (status in ('Recebido', 'Pendente')),
  data date not null default current_date
);

create table if not exists public.project_documents (
  id text primary key,
  projeto_id text not null references public.projects(id) on delete cascade,
  nome text not null,
  file_url text,
  file_path text,
  criado_em timestamptz not null default now()
);

create table if not exists public.clientes (
  id text primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  projeto_id text not null unique references public.projects(id) on delete cascade,
  nome text not null,
  email text not null,
  criado_em timestamptz not null default now()
);

create table if not exists public.etapas_projeto (
  id text primary key,
  projeto_id text not null references public.projects(id) on delete cascade,
  nome text not null,
  descricao text,
  data_prevista date not null,
  status text not null check (status in ('pendente', 'em_andamento', 'concluida')),
  ordem integer not null default 0,
  concluida_em timestamptz,
  criado_em timestamptz not null default now()
);

create table if not exists public.atualizacoes_projeto (
  id text primary key,
  projeto_id text not null references public.projects(id) on delete cascade,
  titulo text not null,
  descricao text,
  icone text not null default 'check'
    check (icone in ('check', 'progress', 'message', 'upload', 'review')),
  criado_em timestamptz not null default now()
);

create table if not exists public.mensagens_projeto (
  id text primary key,
  projeto_id text not null references public.projects(id) on delete cascade,
  remetente_tipo text not null check (remetente_tipo in ('cliente', 'socio')),
  remetente_nome text not null,
  texto text not null,
  criado_em timestamptz not null default now()
);

create table if not exists public.documentos_projeto (
  id text primary key,
  projeto_id text not null references public.projects(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('contrato', 'briefing', 'layout', 'outros')),
  url text,
  file_path text,
  criado_em timestamptz not null default now()
);

create table if not exists public.checklist_templates (
  id text primary key,
  nome text not null,
  tipo_projeto text not null,
  estrutura jsonb not null,
  criado_por text not null,
  criado_em timestamptz not null default now(),
  is_default boolean not null default false
);

create table if not exists public.checklists_projeto (
  id text primary key,
  projeto_id text not null references public.projects(id) on delete cascade,
  template_id text references public.checklist_templates(id) on delete set null,
  estrutura jsonb not null,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'liberado', 'em_preenchimento', 'completo')),
  liberado_em timestamptz,
  enviado_em timestamptz,
  criado_em timestamptz not null default now(),
  reaberto_em timestamptz,
  ultimo_salvamento_em timestamptz
);

create table if not exists public.checklist_respostas (
  id text primary key,
  checklist_id text not null references public.checklists_projeto(id) on delete cascade,
  item_id text not null,
  valor jsonb,
  atualizado_em timestamptz not null default now(),
  unique (checklist_id, item_id)
);

create table if not exists public.etapas_templates (
  id text primary key,
  nome text not null,
  tipo_projeto text not null,
  etapas jsonb not null,
  criado_por text not null,
  criado_em timestamptz not null default now(),
  is_default boolean not null default false
);

create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_prazo on public.projects(prazo);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_criado_em on public.leads(criado_em desc);
create index if not exists idx_status_history_project on public.project_status_history(projeto_id, alterado_em desc);
create index if not exists idx_ramificacoes_project on public.ramificacoes(projeto_id, ordem);
create index if not exists idx_tarefas_project on public.tarefas(projeto_id, status);
create index if not exists idx_tarefas_responsavel on public.tarefas(responsavel_id, status);
create index if not exists idx_financeiro_data on public.financeiro(data desc);
create index if not exists idx_project_documents_project on public.project_documents(projeto_id, criado_em desc);
create index if not exists idx_clientes_project on public.clientes(projeto_id);
create index if not exists idx_clientes_user on public.clientes(user_id);
create index if not exists idx_etapas_projeto on public.etapas_projeto(projeto_id, ordem);
create index if not exists idx_atualizacoes_projeto on public.atualizacoes_projeto(projeto_id, criado_em desc);
create index if not exists idx_mensagens_projeto on public.mensagens_projeto(projeto_id, criado_em desc);
create index if not exists idx_documentos_projeto on public.documentos_projeto(projeto_id, criado_em desc);
create index if not exists idx_checklists_projeto on public.checklists_projeto(projeto_id, criado_em desc);
create index if not exists idx_checklist_respostas on public.checklist_respostas(checklist_id, atualizado_em desc);

alter table public.partners enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.projects enable row level security;
alter table public.leads enable row level security;
alter table public.project_status_history enable row level security;
alter table public.ramificacoes enable row level security;
alter table public.tarefas enable row level security;
alter table public.financeiro enable row level security;
alter table public.project_documents enable row level security;
alter table public.clientes enable row level security;
alter table public.etapas_projeto enable row level security;
alter table public.atualizacoes_projeto enable row level security;
alter table public.mensagens_projeto enable row level security;
alter table public.documentos_projeto enable row level security;
alter table public.checklist_templates enable row level security;
alter table public.checklists_projeto enable row level security;
alter table public.checklist_respostas enable row level security;
alter table public.etapas_templates enable row level security;

drop policy if exists "leads_anon_insert" on public.leads;
create policy "leads_anon_insert"
on public.leads
for insert
to anon
with check (true);

drop policy if exists "clientes_select_own" on public.clientes;
create policy "clientes_select_own"
on public.clientes
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "clientes_update_own" on public.clientes;
create policy "clientes_update_own"
on public.clientes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "etapas_projeto_select_own_project" on public.etapas_projeto;
create policy "etapas_projeto_select_own_project"
on public.etapas_projeto
for select
to authenticated
using (
  projeto_id in (
    select projeto_id from public.clientes where user_id = auth.uid()
  )
);

drop policy if exists "atualizacoes_projeto_select_own_project" on public.atualizacoes_projeto;
create policy "atualizacoes_projeto_select_own_project"
on public.atualizacoes_projeto
for select
to authenticated
using (
  projeto_id in (
    select projeto_id from public.clientes where user_id = auth.uid()
  )
);

drop policy if exists "documentos_projeto_select_own_project" on public.documentos_projeto;
create policy "documentos_projeto_select_own_project"
on public.documentos_projeto
for select
to authenticated
using (
  projeto_id in (
    select projeto_id from public.clientes where user_id = auth.uid()
  )
);

drop policy if exists "mensagens_projeto_select_own_project" on public.mensagens_projeto;
create policy "mensagens_projeto_select_own_project"
on public.mensagens_projeto
for select
to authenticated
using (
  projeto_id in (
    select projeto_id from public.clientes where user_id = auth.uid()
  )
);

drop policy if exists "mensagens_projeto_insert_own_project" on public.mensagens_projeto;
create policy "mensagens_projeto_insert_own_project"
on public.mensagens_projeto
for insert
to authenticated
with check (
  remetente_tipo = 'cliente'
  and projeto_id in (
    select projeto_id from public.clientes where user_id = auth.uid()
  )
);

drop policy if exists "checklists_projeto_select_own_project" on public.checklists_projeto;
create policy "checklists_projeto_select_own_project"
on public.checklists_projeto
for select
to authenticated
using (
  projeto_id in (
    select projeto_id from public.clientes where user_id = auth.uid()
  )
);

drop policy if exists "checklist_respostas_select_own_project" on public.checklist_respostas;
create policy "checklist_respostas_select_own_project"
on public.checklist_respostas
for select
to authenticated
using (
  checklist_id in (
    select id
    from public.checklists_projeto
    where projeto_id in (
      select projeto_id from public.clientes where user_id = auth.uid()
    )
  )
);

insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

drop policy if exists "project_documents_storage_read" on storage.objects;
create policy "project_documents_storage_read"
on storage.objects
for select
to authenticated
using (bucket_id = 'project-documents');

drop policy if exists "project_documents_storage_insert" on storage.objects;
create policy "project_documents_storage_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'project-documents');

drop policy if exists "project_documents_storage_update" on storage.objects;
create policy "project_documents_storage_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'project-documents')
with check (bucket_id = 'project-documents');

drop policy if exists "project_documents_storage_delete" on storage.objects;
create policy "project_documents_storage_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'project-documents');

insert into public.workspace_settings (id)
values ('workspace-settings')
on conflict (id) do nothing;

-- Segurança aplicada também quando este bootstrap é usado em um projeto novo.
-- O endpoint server-side de leads usa a chave secreta; não há insert anônimo direto.
drop policy if exists "leads_anon_insert" on public.leads;
drop policy if exists "clientes_update_own" on public.clientes;

create or replace function public.is_partner()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.partners where auth_user_id = (select auth.uid())
  );
$$;

create or replace function public.client_has_project(target_project_id text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.clientes
    where user_id = (select auth.uid()) and projeto_id = target_project_id
  );
$$;

revoke all on function public.is_partner() from public;
grant execute on function public.is_partner() to authenticated;
revoke all on function public.client_has_project(text) from public;
grant execute on function public.client_has_project(text) to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'partners', 'workspace_settings', 'projects', 'leads', 'project_status_history',
    'ramificacoes', 'tarefas', 'financeiro', 'project_documents', 'etapas_projeto',
    'atualizacoes_projeto', 'mensagens_projeto', 'documentos_projeto',
    'checklist_templates', 'checklists_projeto', 'checklist_respostas', 'etapas_templates'
  ] loop
    execute format('drop policy if exists "partner_full_access" on public.%I', table_name);
    execute format(
      'create policy "partner_full_access" on public.%I for all to authenticated using (public.is_partner()) with check (public.is_partner())',
      table_name
    );
  end loop;
end;
$$;

create or replace function public.storage_object_project_id(object_name text)
returns text language sql immutable
as $$
  select case when split_part(object_name, '/', 1) = 'projects'
    then nullif(split_part(object_name, '/', 2), '') else null end;
$$;

update storage.buckets set public = false where id = 'project-documents';

drop policy if exists "project_documents_storage_read" on storage.objects;
drop policy if exists "project_documents_storage_insert" on storage.objects;
drop policy if exists "project_documents_storage_update" on storage.objects;
drop policy if exists "project_documents_storage_delete" on storage.objects;
drop policy if exists "project_documents_storage_partner_read" on storage.objects;
drop policy if exists "project_documents_storage_partner_insert" on storage.objects;
drop policy if exists "project_documents_storage_partner_update" on storage.objects;
drop policy if exists "project_documents_storage_partner_delete" on storage.objects;
drop policy if exists "project_documents_storage_client_read" on storage.objects;
drop policy if exists "project_documents_storage_client_insert" on storage.objects;
drop policy if exists "project_documents_storage_client_update" on storage.objects;
drop policy if exists "project_documents_storage_client_delete" on storage.objects;

create policy "project_documents_storage_read" on storage.objects
for select to authenticated
using (
  bucket_id = 'project-documents'
  and (public.is_partner() or public.client_has_project(public.storage_object_project_id(name)))
);
