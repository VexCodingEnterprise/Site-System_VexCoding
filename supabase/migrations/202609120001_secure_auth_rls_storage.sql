-- VexCoding: autenticação, RLS e Storage seguros.
-- Esta migration é incremental e não recria tabelas nem apaga dados de negócio.
-- Ela deve ser aplicada depois de 202609120000_bootstrap.sql. A CLI do Supabase
-- respeita essa ordem automaticamente; no SQL Editor, execute os dois arquivos.
-- Execute primeiro em um projeto de staging e revise o plano antes do projeto de produção.

do $$
begin
  if to_regclass('public.partners') is null then
    raise exception 'Schema base ausente: execute 202609120000_bootstrap.sql antes desta migration.';
  end if;
end;
$$;

create index if not exists idx_partners_auth_user_id on public.partners(auth_user_id);
create index if not exists idx_clientes_user_project on public.clientes(user_id, projeto_id);

alter table public.leads add column if not exists empresa text not null default '';

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

create or replace function public.is_partner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.partners
    where auth_user_id = (select auth.uid())
  );
$$;

create or replace function public.client_has_project(target_project_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clientes
    where user_id = (select auth.uid())
      and projeto_id = target_project_id
  );
$$;

revoke all on function public.is_partner() from public;
grant execute on function public.is_partner() to authenticated;
revoke all on function public.client_has_project(text) from public;
grant execute on function public.client_has_project(text) to authenticated;

-- Funções administrativas: acesso apenas a parceiros vinculados a auth.users.
drop policy if exists "leads_anon_insert" on public.leads;
drop policy if exists "partners_full_access" on public.partners;
create policy "partners_full_access" on public.partners
for all to authenticated
using (public.is_partner())
with check (public.is_partner());

drop policy if exists "workspace_settings_partner_access" on public.workspace_settings;
create policy "workspace_settings_partner_access" on public.workspace_settings
for all to authenticated
using (public.is_partner())
with check (public.is_partner());

-- As tabelas operacionais nunca ficam disponíveis a clientes.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'projects', 'leads', 'project_status_history', 'ramificacoes', 'tarefas',
    'financeiro', 'project_documents', 'etapas_templates', 'checklist_templates'
  ] loop
    execute format('drop policy if exists "partner_full_access" on public.%I', table_name);
    execute format(
      'create policy "partner_full_access" on public.%I for all to authenticated using (public.is_partner()) with check (public.is_partner())',
      table_name
    );
  end loop;
end;
$$;

-- O cliente pode consultar somente o próprio projeto e seus artefatos.
drop policy if exists "clientes_update_own" on public.clientes;
drop policy if exists "clientes_select_own_project" on public.clientes;
create policy "clientes_select_own_project" on public.clientes
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "projects_client_select_own" on public.projects;
create policy "projects_client_select_own" on public.projects
for select to authenticated
using (public.client_has_project(id));

drop policy if exists "etapas_projeto_client_select_own" on public.etapas_projeto;
create policy "etapas_projeto_client_select_own" on public.etapas_projeto
for select to authenticated
using (public.client_has_project(projeto_id));

drop policy if exists "atualizacoes_projeto_client_select_own" on public.atualizacoes_projeto;
create policy "atualizacoes_projeto_client_select_own" on public.atualizacoes_projeto
for select to authenticated
using (public.client_has_project(projeto_id));

drop policy if exists "documentos_projeto_client_select_own" on public.documentos_projeto;
create policy "documentos_projeto_client_select_own" on public.documentos_projeto
for select to authenticated
using (public.client_has_project(projeto_id));

drop policy if exists "mensagens_projeto_client_select_own" on public.mensagens_projeto;
create policy "mensagens_projeto_client_select_own" on public.mensagens_projeto
for select to authenticated
using (public.client_has_project(projeto_id));

drop policy if exists "mensagens_projeto_client_insert_own" on public.mensagens_projeto;
create policy "mensagens_projeto_client_insert_own" on public.mensagens_projeto
for insert to authenticated
with check (
  remetente_tipo = 'cliente'
  and public.client_has_project(projeto_id)
);

drop policy if exists "checklists_projeto_client_select_own" on public.checklists_projeto;
create policy "checklists_projeto_client_select_own" on public.checklists_projeto
for select to authenticated
using (public.client_has_project(projeto_id));

drop policy if exists "checklist_respostas_client_select_own" on public.checklist_respostas;
create policy "checklist_respostas_client_select_own" on public.checklist_respostas
for select to authenticated
using (
  checklist_id in (
    select id from public.checklists_projeto where public.client_has_project(projeto_id)
  )
);

drop policy if exists "checklist_respostas_client_insert_own" on public.checklist_respostas;
create policy "checklist_respostas_client_insert_own" on public.checklist_respostas
for insert to authenticated
with check (
  checklist_id in (
    select id from public.checklists_projeto where public.client_has_project(projeto_id)
  )
);

drop policy if exists "checklist_respostas_client_update_own" on public.checklist_respostas;
create policy "checklist_respostas_client_update_own" on public.checklist_respostas
for update to authenticated
using (
  checklist_id in (
    select id from public.checklists_projeto where public.client_has_project(projeto_id)
  )
)
with check (
  checklist_id in (
    select id from public.checklists_projeto where public.client_has_project(projeto_id)
  )
);

-- O caminho obrigatório é projects/<project_id>/<arquivo>.
create or replace function public.storage_object_project_id(object_name text)
returns text
language sql
immutable
as $$
  select case
    when split_part(object_name, '/', 1) = 'projects' then nullif(split_part(object_name, '/', 2), '')
    else null
  end;
$$;

update storage.buckets
set public = false
where id = 'project-documents';

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

create policy "project_documents_storage_partner_read" on storage.objects
for select to authenticated
using (bucket_id = 'project-documents' and public.is_partner());

create policy "project_documents_storage_partner_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'project-documents' and public.is_partner());

create policy "project_documents_storage_partner_update" on storage.objects
for update to authenticated
using (bucket_id = 'project-documents' and public.is_partner())
with check (bucket_id = 'project-documents' and public.is_partner());

create policy "project_documents_storage_partner_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'project-documents' and public.is_partner());

create policy "project_documents_storage_client_read" on storage.objects
for select to authenticated
using (
  bucket_id = 'project-documents'
  and public.client_has_project(public.storage_object_project_id(name))
);

-- Remove a credencial legada somente quando a coluna ainda existir e todos os
-- parceiros já estiverem vinculados ao Supabase Auth. Assim a migration falha
-- de forma segura em vez de apagar o único caminho de acesso administrativo.
do $$
declare
  has_legacy_hash boolean;
  has_unlinked_partner boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'partners'
      and column_name = 'password_hash'
  ) into has_legacy_hash;

  if has_legacy_hash then
    select exists (select 1 from public.partners where auth_user_id is null)
      into has_unlinked_partner;

    if has_unlinked_partner then
      raise exception 'Vincule todos os parceiros ao Supabase Auth antes de remover password_hash.';
    end if;

    alter table public.partners drop column password_hash;
  end if;
end;
$$;
