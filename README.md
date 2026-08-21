# RH + CRM — Distribuidora de Fertilizantes

Sistema web interno com dois módulos:

1. **Gestão de Pessoas (RH)** — colaboradores, documentos, pagamentos.
2. **CRM comercial** — clientes/propriedades rurais, pipeline de vendas, visitas técnicas.

Stack: **Next.js (App Router)** + **Supabase** (Postgres + Auth + RLS) + **Cloudflare Workers** (via OpenNext) + **GitHub** (deploy automático) + **Make.com** (automações/alertas) + **Google Drive** (documentos) + **Gmail** (notificações).

> Este projeto não substitui o ERP legado da empresa (produtos, NF-e, comissão). Ele referencia esses dados apenas via campos de texto livre (`referencia_externa`).

## 1. Configuração local

```bash
npm install
cp .env.example .env.local   # preencha com a URL e a anon key do seu projeto Supabase
npm run dev
```

Acesse `http://localhost:3000`. A tela `/login` é a única rota pública — não há autocadastro por design; contas são criadas pelo administrador (ver seção 3).

Variáveis de ambiente (`.env.local`, nunca commitado — veja `.gitignore`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 2. Banco de dados (Supabase)

O schema vive em `supabase/migrations/`:

- `0001_fase0_fundacao.sql` — `colaboradores`, `documentos_colaborador`, `pagamentos_colaborador`, funções de RLS (`auth_colaborador_id`, `auth_cargo`, `auth_is_admin`).
- `0002_fase1_crm.sql` — `clientes`, `visitas`, `oportunidades`, função `auth_equipe_ids`.

Todas as tabelas têm **Row Level Security** habilitada:

| Papel | Regra |
|---|---|
| Vendedor | vê/edita apenas seus próprios clientes, visitas e oportunidades |
| Supervisor | vê os registros da própria equipe (subordinados diretos) |
| Gerente / Administrativo | acesso total, incluindo RH (colaboradores, documentos, pagamentos) |

Aplique as migrations num projeto Supabase novo (SQL Editor ou `supabase db push` se usar a CLI, na ordem numérica dos arquivos).

### Free tier "dorme" após ~7 dias sem uso

Configure um heartbeat semanal no Make.com fazendo um `GET` simples em `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/` com o header `apikey` (a chave publicável) — qualquer requisição autenticada reinicia o timer de inatividade.

### Convidar um usuário para acessar o sistema

Fluxo pelo próprio app (gerente/administrativo): abra o colaborador em **Colaboradores → (nome) → Acesso ao sistema** e clique em "Convidar para acessar o sistema" com o e-mail da pessoa. Isso cria a conta no Supabase Auth, envia um e-mail com link para a pessoa definir a senha, e já vincula automaticamente ao registro do colaborador (`user_id`) — sem precisar mexer no SQL Editor.

Essa tela usa a **service role key** (nunca exposta ao navegador) — veja a variável `SUPABASE_SERVICE_ROLE_KEY` na seção de deploy.

Recuperação/troca de senha: qualquer usuário pode usar "Esqueci minha senha" na tela de login, ou trocar a senha logado em **Trocar senha** (link no menu, ao lado do nome).

## 3. Deploy — Cloudflare (GitHub → deploy automático)

O plano gratuito do **Vercel Hobby proíbe uso comercial** (inclusive sistemas internos de empresa) — por isso o deploy é no **Cloudflare**, cujo free tier permite uso comercial.

O adaptador oficial e ativamente mantido para Next.js no Cloudflare hoje é o **OpenNext** (`@opennextjs/cloudflare`), que publica em **Cloudflare Workers** — o mesmo produto gratuito que hoje engloba o que era o "Cloudflare Pages" (assets estáticos + SSR, domínio `*.workers.dev` grátis, uso comercial permitido). `@cloudflare/next-on-pages` (o adaptador clássico de "Pages") ainda não suporta Next.js 16, por isso não foi usado aqui.

Scripts já configurados em `package.json`:

```bash
npm run cf:build     # gera .open-next/ a partir do build do Next.js
npm run cf:preview   # build + preview local via workerd
npm run cf:deploy    # build + wrangler deploy
```

### Passo a passo (dashboard, sem precisar da CLI)

1. Faça login em [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Import a repository**.
2. Conecte a conta do GitHub e selecione este repositório.
3. Configure o build:
   - **Build command:** `npm run cf:build`
   - **Deploy command:** `npx wrangler deploy`
   - (o Cloudflare detecta o `wrangler.jsonc` automaticamente)
4. Em **Build variables and secrets**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mesmos valores do `.env.local`) — essas duas são lidas em tempo de *build* (viram parte do JS enviado ao navegador), então precisam estar especificamente nessa seção, não em "Variables & Secrets" runtime.
5. Depois de criado o Worker, vá em **Settings → Variables & Secrets** (essa sim é runtime) e adicione `SUPABASE_SERVICE_ROLE_KEY` como **Secret** (Supabase → Project Settings → API → service_role secret). Sem isso, tudo funciona exceto o convite de usuários pelo painel (colaboradores/[id] → Acesso ao sistema).
6. Salve — todo push na branch principal do GitHub dispara um novo deploy automaticamente.

### Alternativa via CLI (primeira vez / deploy manual)

```bash
npx wrangler login
npm run cf:deploy
```

## 4. Automações — Make.com

Crie os cenários abaixo no [Make.com](https://make.com) (free tier, ~1000 operações/mês). Todos usam o módulo **Supabase** (ou HTTP genérico com a `service_role` key, guardada como credencial no Make — nunca no código) para consultar as tabelas, e **Gmail** para notificar.

### a) Heartbeat semanal (evita o projeto Supabase pausar)

- **Trigger:** agendamento semanal (ex.: toda segunda-feira, 6h).
- **Ação:** HTTP `GET` em `{SUPABASE_URL}/rest/v1/colaboradores?select=id&limit=1` com header `apikey`.

### b) Documentos vencendo em ≤30 dias

- **Trigger:** agendamento diário.
- **Ação 1:** consultar `documentos_colaborador` onde `data_vencimento <= hoje + 30 dias` e `data_vencimento >= hoje` (join com `colaboradores` para nome/e-mail do responsável de RH).
- **Ação 2:** Gmail — enviar e-mail para o RH/administrativo com a lista.

### c) Follow-up de visita atrasado

- **Trigger:** agendamento diário.
- **Ação 1:** consultar `visitas` onde `proximo_followup < hoje` (join com `clientes` e `colaboradores` para nome do vendedor).
- **Ação 2:** Gmail — enviar e-mail para o vendedor responsável (e opcionalmente para o supervisor).

> As duas últimas automações duplicam, por e-mail, alertas que também aparecem nos painéis do próprio app (`/` e `/colaboradores`) — o Make.com garante que o alerta chegue mesmo que ninguém abra o sistema naquele dia.

## 5. Documentos (Google Drive)

O campo `arquivo_url` em `documentos_colaborador` guarda apenas o **link** do arquivo no Google Drive (não há upload direto no app). Fluxo recomendado: subir o arquivo numa pasta compartilhada do Drive, copiar o link de compartilhamento e colar no formulário de documento do colaborador.

## 6. Roadmap

- [x] Fase 0 — Fundação: schema, autenticação, RLS, CRUD de colaboradores.
- [x] Fase 1 — CRM: clientes, visitas, pipeline kanban, dashboard por vendedor.
- [x] Fase 2 — RH completo: documentos, pagamentos (alertas de vencimento via Make.com — configurar conforme seção 4).
- [ ] Fase 3 — Fora do escopo atual: estoque, financeiro, relatórios avançados, compliance.

## 7. Fora de escopo (por design)

- Emissão de NF-e ou qualquer módulo fiscal.
- Cadastro de produtos com ficha técnica MAPA.
- Cálculo automático de comissão (permanece no ERP legado; este sistema só referencia via `referencia_externa`).
- Integração automática com o ERP legado (sem API disponível).
