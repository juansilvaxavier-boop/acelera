# Proxy de Consulta de Faturas (Cloudflare Worker)

Publica a rota `GET /api/faturas?documento=...` que a página **Consulta de
Faturas** do site WordPress.com da Acelera chama para consultar boletos/Pix
na API do Banco Cora. Usa o free tier do Cloudflare Workers (permite uso
comercial, ao contrário do Vercel Hobby).

Eu não tenho como executar estes passos por você (preciso do certificado/chave
reais da Cora e de acesso interativo à sua conta Cloudflare) — mas o código já
está pronto, só falta rodar os comandos abaixo.

## 1. Instalar o wrangler (se ainda não tiver)

```bash
cd site-institucional/faturas-proxy-cf
npm install
npx wrangler login
```

## 2. Subir o certificado mTLS da Cora

```bash
npx wrangler cert upload mtls-certificate \
  --cert /caminho/para/cora-cert.pem \
  --key /caminho/para/cora-key.pem \
  --name cora-mtls-cert
```

Copie o `certificate_id` retornado e cole em `wrangler.jsonc`, no campo
`mtls_certificates[0].certificate_id` (substituindo `SEU_CERTIFICATE_ID`).

## 3. Configurar o client_id da Cora (secret)

```bash
npx wrangler secret put CORA_CLIENT_ID
```
(cole o valor quando solicitado)

## 4. Deploy

```bash
npm run deploy
```

Ao final, o wrangler mostra a URL pública, algo como:

```
https://acelera-faturas-proxy.<seu-subdominio>.workers.dev
```

## 5. Ligar a página do WordPress a essa URL

Copie essa URL e me avise (ou edite você mesmo) — a página "Consulta de
Faturas" no WordPress.com tem uma constante `API_URL` no bloco de HTML/script
que precisa apontar para `https://.../api/faturas`.

## Variáveis já configuradas em `wrangler.jsonc`

- `CORA_ENV`: `production` (troque para `stage` se for testar no ambiente de
  homologação da Cora).
- `ALLOWED_ORIGIN`: `https://acelera.ind.br` (controla o CORS — troque se o
  domínio final for outro).
