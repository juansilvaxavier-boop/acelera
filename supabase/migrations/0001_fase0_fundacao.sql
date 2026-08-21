-- Fase 0 — Fundação: colaboradores, documentos, pagamentos, autenticação por papel

create table colaboradores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  nome text not null,
  cpf text unique not null,
  cargo text not null check (cargo in ('vendedor','supervisor','gerente','terceiro','motorista','administrativo')),
  tipo_vinculo text not null check (tipo_vinculo in ('CLT','PJ','terceirizado','comissionado')),
  supervisor_id uuid references colaboradores(id),
  data_admissao date,
  status text not null default 'ativo' check (status in ('ativo','inativo','afastado')),
  email text,
  telefone text,
  criado_em timestamptz default now()
);

create table documentos_colaborador (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid references colaboradores(id) not null,
  tipo text not null check (tipo in ('contrato','rg','cpf','cnh','exame_admissional','exame_periodico','outro')),
  arquivo_url text,        -- link do Google Drive
  data_emissao date,
  data_vencimento date,    -- usado para gerar alertas
  criado_em timestamptz default now()
);

create table pagamentos_colaborador (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid references colaboradores(id) not null,
  tipo text not null check (tipo in ('salario','comissao','adiantamento','plr','outro')),
  valor numeric(12,2) not null,
  data_referencia date not null,
  referencia_externa text, -- ex: código da "Ordem de Comissões" no ERP legado, preenchimento manual
  criado_em timestamptz default now()
);

create index idx_colaboradores_supervisor on colaboradores(supervisor_id);
create index idx_colaboradores_user on colaboradores(user_id);
create index idx_documentos_colaborador on documentos_colaborador(colaborador_id);
create index idx_documentos_vencimento on documentos_colaborador(data_vencimento);
create index idx_pagamentos_colaborador on pagamentos_colaborador(colaborador_id);

-- Funções auxiliares para RLS: mapeiam o usuário autenticado (auth.uid()) ao seu registro de colaborador
create or replace function auth_colaborador_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from colaboradores where user_id = auth.uid();
$$;

create or replace function auth_cargo()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select cargo from colaboradores where user_id = auth.uid();
$$;

create or replace function auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth_cargo() in ('gerente','administrativo'), false);
$$;

-- colaboradores
alter table colaboradores enable row level security;

create policy "colaboradores_select" on colaboradores for select
  using (
    auth_is_admin()
    or id = auth_colaborador_id()
    or supervisor_id = auth_colaborador_id()
  );

create policy "colaboradores_insert" on colaboradores for insert
  with check (auth_is_admin());

create policy "colaboradores_update" on colaboradores for update
  using (auth_is_admin())
  with check (auth_is_admin());

create policy "colaboradores_delete" on colaboradores for delete
  using (auth_is_admin());

-- documentos_colaborador
alter table documentos_colaborador enable row level security;

create policy "documentos_select" on documentos_colaborador for select
  using (
    auth_is_admin()
    or colaborador_id = auth_colaborador_id()
    or colaborador_id in (select id from colaboradores where supervisor_id = auth_colaborador_id())
  );

create policy "documentos_insert" on documentos_colaborador for insert
  with check (auth_is_admin());

create policy "documentos_update" on documentos_colaborador for update
  using (auth_is_admin())
  with check (auth_is_admin());

create policy "documentos_delete" on documentos_colaborador for delete
  using (auth_is_admin());

-- pagamentos_colaborador
alter table pagamentos_colaborador enable row level security;

create policy "pagamentos_select" on pagamentos_colaborador for select
  using (
    auth_is_admin()
    or colaborador_id = auth_colaborador_id()
    or colaborador_id in (select id from colaboradores where supervisor_id = auth_colaborador_id())
  );

create policy "pagamentos_insert" on pagamentos_colaborador for insert
  with check (auth_is_admin());

create policy "pagamentos_update" on pagamentos_colaborador for update
  using (auth_is_admin())
  with check (auth_is_admin());

create policy "pagamentos_delete" on pagamentos_colaborador for delete
  using (auth_is_admin());
