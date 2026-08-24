# Site institucional Acelera — deploy na Hostinger + domínio no registro.br

Este diretório contém um tema WordPress simples (`wp-theme-acelera/`) para o
site institucional da Acelera, feito para ser hospedado na Hostinger e
publicado no domínio **acelera.ind.br** (já registrado no registro.br).

> Eu não tenho acesso à sua conta Hostinger nem ao seu painel do registro.br,
> então não consigo executar estes passos por você — mas todo o conteúdo já
> está pronto, e o roteiro abaixo é o suficiente para colar/clicar sem
> precisar tomar nenhuma decisão técnica nova.

## O que já está pronto

- `wp-theme-acelera/` — tema WordPress completo (cabeçalho, rodapé, página
  inicial com seções "Sobre" e "Contato", e uma página de **Consulta de
  Faturas** que integra com o Banco Cora).
- `wp-config-snippet.php` — bloco de configuração para colar no
  `wp-config.php`, com as credenciais da Cora (nunca commitado com valores
  reais).
- A consulta de faturas foi reimplementada em **PHP** (rota REST do
  WordPress, `functions.php`), porque o arquivo original `api/faturas.js`
  é uma função serverless em Node.js (formato Vercel) — que hospedagem
  compartilhada da Hostinger com WordPress não executa. A rota PHP faz
  exatamente a mesma coisa: autentica na Cora via mTLS (certificado +
  chave, nunca expostos ao navegador) e devolve as faturas em aberto.

## 1. Contratar hospedagem WordPress na Hostinger

1. Em [hostinger.com.br](https://www.hostinger.com.br), contrate um plano
   de **Hospedagem WordPress** (qualquer plano serve; PHP 8+ é o mínimo).
2. No assistente de configuração, quando pedir o domínio, escolha
   **"Já tenho um domínio"** e informe `acelera.ind.br` (não compre um
   domínio novo — o seu já existe no registro.br).
3. Finalize a contratação. A Hostinger vai instalar o WordPress
   automaticamente (ou use hPanel → **Sites** → **Instalar WordPress** se
   precisar fazer manualmente).

## 2. Apontar o domínio acelera.ind.br (registro.br → Hostinger)

Escolha **uma** das duas opções abaixo (não faça as duas):

### Opção A — Trocar os servidores DNS (nameservers) — mais simples

1. No **hPanel da Hostinger**, vá em **Domínios → acelera.ind.br → DNS /
   Nameservers** e copie os nameservers indicados (algo como
   `ns1.dns-parking.com` e `ns2.dns-parking.com`, ou os nameservers
   específicos da sua conta).
2. Acesse [registro.br](https://registro.br) → **Painel** → seu login →
   domínio `acelera.ind.br` → **Alterar Servidores DNS (Editar Zona)**.
3. Substitua os nameservers atuais pelos da Hostinger e salve.
4. Aguarde a propagação (pode levar de algumas horas até ~24-48h).

Com essa opção, toda a gestão de DNS passa a ser feita pelo painel da
Hostinger.

### Opção B — Manter DNS no registro.br, só apontar os registros

1. No hPanel da Hostinger, veja o **IP do servidor** (hPanel → **Sites** →
   seu site → **Visão geral**, ou em **Contas de hospedagem**).
2. No painel do registro.br, em `acelera.ind.br` → **Editar Zona DNS**,
   crie/ajuste:
   - Registro **A** para `@` (ou `acelera.ind.br`) apontando para o IP da
     Hostinger.
   - Registro **CNAME** para `www` apontando para `acelera.ind.br.`
3. Salve e aguarde a propagação.

## 3. Enviar o tema para o WordPress

1. Compacte a pasta `wp-theme-acelera/` inteira em um arquivo `.zip`
   chamado, por exemplo, `wp-theme-acelera.zip` (o `.zip` precisa conter a
   pasta `wp-theme-acelera` na raiz, com `style.css` dentro dela).
2. No WP Admin (`https://acelera.ind.br/wp-admin`) vá em **Aparência →
   Temas → Adicionar novo → Enviar tema**, selecione o `.zip` e clique em
   **Instalar agora**.
3. Clique em **Ativar**.

## 4. Criar as páginas

1. **Páginas → Adicionar nova**, título "Início" (não precisa de
   conteúdo no editor — o layout vem de `front-page.php`). Publique.
2. Em **Configurações → Leitura**, deixe como está (o tema usa
   `front-page.php` automaticamente); se preferir, defina explicitamente
   "Uma página estática" com a página "Início" escolhida.
3. **Páginas → Adicionar nova**, título "Consulta de Faturas", slug
   `consulta-de-faturas`. No painel **Atributos da página** (lado
   direito), em **Modelo**, selecione **"Consulta de Faturas"**. Publique.

## 5. Configurar a integração com a Cora (opcional, só se for usar a consulta de faturas)

1. Envie os arquivos de certificado (`cora-cert.pem`) e chave privada
   (`cora-key.pem`) fornecidos pela Cora para o servidor **fora** da pasta
   `public_html` — por exemplo, crie uma pasta `cora/` no diretório home
   da conta (acessível via **Gerenciador de Arquivos** do hPanel ou FTP),
   um nível acima de `public_html`.
2. Abra `wp-config.php` (raiz do WordPress) pelo Gerenciador de Arquivos e
   cole o conteúdo de `wp-config-snippet.php` **antes** da linha
   `/* That's all, stop editing! */`, preenchendo:
   - `ACELERA_CORA_CLIENT_ID` com o client_id da Cora;
   - os caminhos `ACELERA_CORA_CERT_PATH` / `ACELERA_CORA_KEY_PATH` com o
     caminho absoluto real dos arquivos enviados no passo anterior.
3. Se não for usar a consulta de faturas agora, pode pular este passo — a
   página simplesmente mostrará "Integração com a Cora ainda não
   configurada neste ambiente."

## 6. Ativar HTTPS

No hPanel, vá em **Sites → acelera.ind.br → SSL** e ative o certificado
gratuito (Let's Encrypt). Depois, em **Aparência → Personalizar** ou em
**Configurações → Geral**, confirme que a URL do site está como
`https://acelera.ind.br`.

## 7. Editar o conteúdo real

Os textos de "Sobre" e "Contato" na página inicial (`front-page.php`)
estão com placeholders marcados `<!-- TODO -->`. Edite diretamente esse
arquivo (reenviando o tema atualizado) com as informações reais da
empresa: descrição, e-mail, telefone/WhatsApp e endereço.

## 8. Testar

- Acesse `https://acelera.ind.br` e confira o layout.
- Acesse `https://acelera.ind.br/consulta-de-faturas/`, informe um
  CPF/CNPJ de teste e confirme que a consulta responde (ou mostra a
  mensagem de integração não configurada, se você ainda não fez o passo 5).
