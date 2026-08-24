# Site institucional Acelera — WordPress.com + domínio acelera.ind.br

## O que já está criado (ao vivo, no WordPress.com)

- **Site:** https://acelera2.wordpress.com (o subdomínio ficou `acelera2` porque
  `acelera.wordpress.com` já estava em uso por outra conta — isso não afeta o
  domínio final, que será `acelera.ind.br`).
- **Painel:** https://acelera2.wordpress.com/wp-admin/
- Conteúdo reconstruído a partir do design de referência que você enviou
  (`Acelera Fertilizantes`), com a logo real, cores da marca (verde
  `#035927` / dourado `#C49855`) e os textos, produtos, telefone/WhatsApp
  (+55 17 98123-6203), e-mail (contato@acelera.ind.br) e endereço (Rua
  Maria Ceron Volpe, 1705 — Vila Toninho, São José do Rio Preto/SP) reais
  do arquivo original.
- **Páginas criadas** (todas como rascunho, propositalmente, para você revisar
  antes de publicar):
  - **Início** (id 5) — hero, estatísticas, "Por que a Acelera".
  - **Sobre nós** (id 13, slug `sobre-nos`) — texto institucional + 4 pilares.
  - **Linha de produtos** (id 14, slug `linha-de-produtos`) — os 12 produtos
    reais, agrupados pelas 5 linhas, cada um com link de orçamento no WhatsApp.
  - **Trabalhe conosco** (id 15, slug `trabalhe-conosco`) — áreas + candidatura
    via WhatsApp/e-mail (sem formulário, pelo mesmo motivo da seção 2).
  - **Consulta de Faturas** (id 6, slug `consulta-de-faturas`) — botão que leva
    para a ferramenta de consulta hospedada separadamente (ver seção 2).
  - **Contato** (id 16, slug `contato`) — WhatsApp, e-mail, endereço, redes
    sociais (Facebook/Instagram/TikTok/LinkedIn reais).
- **Cabeçalho e rodapé** já atualizados com a logo real, menu de navegação
  apontando para as 6 páginas acima, e dados de contato reais no rodapé — falta
  só confirmar o **horário de atendimento** (deixei um placeholder
  `[edite: horário de atendimento]`, pois não veio no material original).
- **O site está marcado como privado.** Antes de divulgar, torne-o público em
  wp-admin → **Configurações → Geral → Visibilidade**.

## 1. Revisar e publicar o conteúdo

1. Acesse o painel e revise as 6 páginas listadas acima — o conteúdo já é o
   real (extraído do arquivo que você enviou), mas vale conferir.
2. Preencha o horário de atendimento no rodapé (**Aparência → Editor → Padrões
   → Footer**, ou peça pra eu fazer assim que você me passar o horário).
3. Em **Configurações → Leitura**, defina "A página inicial exibe" →
   **Uma página estática** → escolha **Início** (só é possível depois de
   publicar a página, veja o próximo passo).
4. Publique as 6 páginas (**Publicar**, no canto superior direito do editor)
   quando estiverem prontas.
5. Em **Configurações → Geral**, mude a visibilidade do site para público.

## 2. Consulta de Faturas (integração com a Cora)

O WordPress.com "Simple" (qualquer plano até Premium) remove `<form>`,
`<script>` e `<iframe>` do conteúdo por segurança — não dá pra rodar a busca
de faturas dentro da própria página do WordPress sem o plano Business
(R$996/ano). Em vez disso, a busca roda numa página separada, servida por um
**Cloudflare Worker** já preparado em `site-institucional/faturas-proxy-cf/`
(free tier, permite uso comercial — ao contrário do Vercel Hobby, que o
`README.md` deste repositório já evita pelo mesmo motivo no sistema
principal). A página "Consulta de Faturas" no WordPress é só um botão que
leva para lá.

Passo a passo completo (certificado mTLS, deploy, variáveis) está em
`site-institucional/faturas-proxy-cf/README.md`. Resumo:

1. `cd site-institucional/faturas-proxy-cf && npm install && npx wrangler login`
2. Subir o certificado da Cora: `npx wrangler cert upload mtls-certificate --cert ... --key ...`
   e colar o `certificate_id` retornado em `wrangler.jsonc`.
3. `npx wrangler secret put CORA_CLIENT_ID`
4. `npm run deploy` — anote a URL gerada (ex.:
   `https://acelera-faturas-proxy.SEU-SUBDOMINIO.workers.dev`).
5. No WordPress, edite a página **Consulta de Faturas** e troque o link do
   botão "Consultar minhas faturas" (atualmente `https://SEU-PROXY.workers.dev/`)
   pela URL real gerada no passo 4. Me avise a URL e eu atualizo por você.

Se você não for usar a consulta de faturas agora, pode pular esta seção —
o botão simplesmente não terá destino até ser configurado.

## 3. Apontar acelera.ind.br para o WordPress.com

**Importante:** conectar um domínio próprio ao WordPress.com exige pelo
menos o **plano Personal** (R$144/ano) — o plano Free só permite o
subdomínio `*.wordpress.com`. Ainda não fiz esse upgrade porque envolve
pagamento; confirme comigo (ou faça você mesmo em wp-admin → **Upgrades →
Planos**) antes de eu prosseguir.

Depois de ter um plano pago ativo, duas formas de conectar `acelera.ind.br`:

### Opção A — Mapear o domínio (mantém o registro no registro.br)

1. Em wp-admin → **Upgrades → Domínios → Adicionar um domínio → Já tenho um
   domínio**, informe `acelera.ind.br`.
2. O WordPress.com vai indicar os registros DNS a criar (normalmente um
   registro **A** apontando para o IP do WordPress.com, mais um **CNAME**
   para `www`).
3. No painel do [registro.br](https://registro.br), em `acelera.ind.br` →
   **Editar Zona DNS**, crie esses registros exatamente como indicado.

### Opção B — Trocar os nameservers para o WordPress.com

1. Em wp-admin → **Upgrades → Domínios → acelera.ind.br → DNS**, veja os
   nameservers do WordPress.com (geralmente `ns1.wordpress.com` e
   `ns2.wordpress.com`).
2. No registro.br → `acelera.ind.br` → **Alterar Servidores DNS**, troque
   para esses nameservers.
3. Toda a gestão de DNS passa a ser feita pelo painel do WordPress.com.

Qualquer uma das opções pode levar algumas horas até 48h para propagar.

## 4. SSL

O WordPress.com emite certificado SSL automaticamente para domínios
conectados — não precisa configurar nada manualmente.
