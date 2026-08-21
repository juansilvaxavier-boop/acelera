-- Fase 1 — CRM: clientes, visitas, oportunidades (pipeline)

create table clientes (
  id uuid primary key default gen_random_uuid(),
  tipo_pessoa text not null check (tipo_pessoa in ('CPF','CNPJ')),
  documento text unique not null,
  nome text not null,
  propriedade text,              -- nome da fazenda
  area_hectares numeric(10,2),
  culturas text[],                -- ex: {soja, milho}
  regiao text,
  vendedor_id uuid references colaboradores(id),
  criado_em timestamptz default now()
);

create table visitas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) not null,
  vendedor_id uuid references colaboradores(id) not null,
  data_visita date not null,
  tipo text check (tipo in ('prospeccao','tecnica','pos_venda')),
  anotacoes text,
  produto_recomendado text,
  proximo_followup date,
  criado_em timestamptz default now()
);

create table oportunidades (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) not null,
  vendedor_id uuid references colaboradores(id) not null,
  estagio text not null check (estagio in ('prospeccao','visita_tecnica','proposta','negociacao','fechado_ganho','fechado_perdido','entrega','pos_venda')),
  valor_estimado numeric(12,2),
  safra text,                     -- ex: "2026/2027 verão"
  previsao_fechamento date,
  criado_em timestamptz default now()
);

create index idx_clientes_vendedor on clientes(vendedor_id);
create index idx_visitas_cliente on visitas(cliente_id);
create index idx_visitas_vendedor on visitas(vendedor_id);
create index idx_visitas_followup on visitas(proximo_followup);
create index idx_oportunidades_cliente on oportunidades(cliente_id);
create index idx_oportunidades_vendedor on oportunidades(vendedor_id);
create index idx_oportunidades_estagio on oportunidades(estagio);

-- Time de um vendedor: ele mesmo, ou (se for supervisor) seus subordinados diretos
create or replace function auth_equipe_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from colaboradores
  where id = auth_colaborador_id()
     or supervisor_id = auth_colaborador_id();
$$;

-- clientes
alter table clientes enable row level security;

create policy "clientes_select" on clientes for select
  using (auth_is_admin() or vendedor_id in (select auth_equipe_ids()));

create policy "clientes_insert" on clientes for insert
  with check (auth_is_admin() or vendedor_id = auth_colaborador_id());

create policy "clientes_update" on clientes for update
  using (auth_is_admin() or vendedor_id = auth_colaborador_id())
  with check (auth_is_admin() or vendedor_id = auth_colaborador_id());

create policy "clientes_delete" on clientes for delete
  using (auth_is_admin() or vendedor_id = auth_colaborador_id());

-- visitas
alter table visitas enable row level security;

create policy "visitas_select" on visitas for select
  using (auth_is_admin() or vendedor_id in (select auth_equipe_ids()));

create policy "visitas_insert" on visitas for insert
  with check (auth_is_admin() or vendedor_id = auth_colaborador_id());

create policy "visitas_update" on visitas for update
  using (auth_is_admin() or vendedor_id = auth_colaborador_id())
  with check (auth_is_admin() or vendedor_id = auth_colaborador_id());

create policy "visitas_delete" on visitas for delete
  using (auth_is_admin() or vendedor_id = auth_colaborador_id());

-- oportunidades
alter table oportunidades enable row level security;

create policy "oportunidades_select" on oportunidades for select
  using (auth_is_admin() or vendedor_id in (select auth_equipe_ids()));

create policy "oportunidades_insert" on oportunidades for insert
  with check (auth_is_admin() or vendedor_id = auth_colaborador_id());

create policy "oportunidades_update" on oportunidades for update
  using (auth_is_admin() or vendedor_id = auth_colaborador_id())
  with check (auth_is_admin() or vendedor_id = auth_colaborador_id());

create policy "oportunidades_delete" on oportunidades for delete
  using (auth_is_admin() or vendedor_id = auth_colaborador_id());
