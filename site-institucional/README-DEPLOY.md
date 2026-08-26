# Site institucional Acelera Fertilizantes — Vercel + domínio acelera.ind.br

## Estado atual (já publicado)

- **Preview ao vivo:** https://acelera-fertilizantes-ihj39zixn-juansxavier.vercel.app
  (link estável do branch: `acelera-fertilizantes-git-claude-wordpress-s-e276b4-juansxavier.vercel.app`)
- **Projeto Vercel:** `acelera-fertilizantes` (time `juansxavier`).
- **Código:** `site-institucional/vercel-site/` — o `index.html` é exatamente o
  arquivo de design que você enviou (logo, produtos, portal de faturas, tudo
  igual), só adicionei a estrutura `<!doctype>/<head>/<body>` que faltava para
  ser um HTML completo. `api/faturas.js` é o proxy original que você mandou,
  sem alterações.
- **Pull Request:** https://github.com/juansilvaxavier-boop/acelera/pull/1 —
  foi necessário porque o "branch de produção" configurado no GitHub deste
  repositório é `claude/vamos-criar-3c6pwu` (de uma sessão anterior, sem
  relação com o site), então a Vercel só gera deploy automático para um branch
  diferente quando existe um PR aberto para ele. Esse PR não precisa ser
  mergeado — ele só existe para manter o deploy de preview ativo. Se preferir
  parar de depender do PR, mude a "Production Branch" nas configurações do
  projeto na Vercel (Project Settings → Git) para
  `claude/wordpress-site-domain-br-u2yfey` (ou para o branch que você
  escolher como definitivo).

## O que falta pra ficar 100% pronto

### 1. Ativar a consulta de faturas de verdade

Agora mesmo `/api/faturas` responde 503 (sem credenciais), e o site
já trata isso graciosamente (mantém os dados de exemplo na tela). Para
ativar de verdade:

1. No painel da Vercel → projeto `acelera-fertilizantes` → **Settings →
   Environment Variables**, adicione:
   - `CORA_CLIENT_ID`
   - `CORA_CERT` (conteúdo do certificado, com `\n` no lugar das quebras de
     linha se colar em uma linha só)
   - `CORA_KEY` (idem, para a chave privada)
   - `CORA_ENV` = `production` (ou `stage` para homologação)
2. Redeploy (a Vercel faz isso automaticamente a cada push, ou use o botão
   "Redeploy" no painel).

### 2. Conectar o domínio acelera.ind.br

1. No painel da Vercel → projeto → **Settings → Domains → Add**, digite
   `acelera.ind.br` (e `www.acelera.ind.br` se quiser).
2. A Vercel mostra os registros DNS necessários — normalmente:
   - Registro **A** para `@` apontando para `76.76.21.21`
   - Registro **CNAME** para `www` apontando para `cname.vercel-dns.com`
   (a Vercel sempre mostra o valor exato no momento — confirme lá, pode
   mudar).
3. No painel do [registro.br](https://registro.br), em `acelera.ind.br` →
   **Editar Zona DNS**, crie esses registros exatamente como indicado.
4. A Vercel emite HTTPS automaticamente assim que o DNS propaga (pode levar
   algumas horas).

### 3. Plano da Vercel (importante)

O time `juansxavier` está no plano **Hobby** (gratuito), que **não permite
uso comercial** pelos termos da Vercel — o mesmo motivo pelo qual o sistema
de RH/CRM deste repositório é hospedado no Cloudflare, e não na Vercel (veja
o `README.md` na raiz). Como este é claramente um site comercial (empresa
real, venda de produtos), o ideal é assinar o **Vercel Pro** antes de
divulgar o domínio publicamente. Isso não impede nada agora (o preview
funciona normalmente), é uma decisão para antes do lançamento oficial.

## Sobre o site no WordPress.com

O site criado anteriormente em `acelera2.wordpress.com` não está mais sendo
usado — a hospedagem definitiva agora é a Vercel. Não apaguei o site do
WordPress.com (ele é seu); me avise se quiser que eu oriente como excluí-lo.
