// src/index.js
//
// Proxy (Cloudflare Worker) entre o site da Acelera e a API do Banco Cora.
// Existe porque a autenticação da Cora usa mTLS (certificado + chave privada)
// e essas credenciais NUNCA podem ficar no navegador/frontend — só aqui.
//
// O certificado/chave ficam no Cloudflare como um "mTLS certificate binding"
// (env.CORA_MTLS) — nunca em variável de texto neste código. Veja README.md
// nesta pasta para o passo a passo de upload do certificado e deploy.
//
// Rota exposta ao site: GET /api/faturas?documento=12345678900
// Resposta: { items: [ { id, descricao, vencimento, valor, status, boleto, linhaDigitavel, pix } ] }

let cachedToken = null;
let cachedTokenExpiry = 0;

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(env) },
  });
}

function hosts(env) {
  const stage = env.CORA_ENV === "stage";
  return {
    tokenHost: stage ? "matls-clients.api.stage.cora.com.br" : "matls-clients.api.cora.com.br",
    apiHost: stage ? "api.stage.cora.com.br" : "api.cora.com.br",
  };
}

async function getToken(env) {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) return cachedToken;

  const { tokenHost } = hosts(env);
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.CORA_CLIENT_ID,
  }).toString();

  // env.CORA_MTLS é o binding do certificado mTLS — a chamada precisa ser
  // feita através dele (não pelo fetch global) para apresentar o certificado.
  const res = await env.CORA_MTLS.fetch(`https://${tokenHost}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!res.ok) {
    throw new Error(`Falha ao obter token da Cora (status ${res.status})`);
  }

  const result = await res.json();
  cachedToken = result.access_token;
  const ttlMs = result.expires_in ? (result.expires_in - 60) * 1000 : 23 * 60 * 60 * 1000;
  cachedTokenExpiry = now + ttlMs;
  return cachedToken;
}

function mapInvoice(inv) {
  return {
    id: inv.id,
    descricao: (inv.services && inv.services[0] && inv.services[0].name) || inv.code || "Fatura Acelera",
    vencimento: inv.payment_terms && inv.payment_terms.due_date,
    valor: (inv.total_amount || 0) / 100,
    status: inv.status, // OPEN | PAID | LATE | CANCELLED | DRAFT
    boleto: (inv.payment_options && inv.payment_options.bank_slip && inv.payment_options.bank_slip.url) || null,
    linhaDigitavel:
      (inv.payment_options && inv.payment_options.bank_slip && inv.payment_options.bank_slip.digitable) || null,
    pix: (inv.pix && inv.pix.emv) || null,
  };
}

function paginaConsulta() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Consulta de Faturas — Acelera Fertilizantes</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #101418; background: #fff; }
  .wrap { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 1.6rem; margin: 0 0 8px; }
  p.lead { color: #5b6470; margin: 0 0 24px; }
  form { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
  input { flex: 1; min-width: 220px; padding: 12px 14px; border: 1px solid #e4e7eb; border-radius: 8px; font-size: 1rem; }
  button { padding: 12px 22px; border: 0; border-radius: 4px; background: #035927; color: #fff; font-weight: 700; cursor: pointer; }
  button:hover { background: #02431D; }
  #status { color: #5b6470; margin: 12px 0; }
  ul { list-style: none; padding: 0; margin: 20px 0 0; display: grid; gap: 12px; }
  li { border: 1px solid #e4e7eb; border-radius: 4px; padding: 16px; border-left: 3px solid #C49855; }
  li a { color: #035927; font-weight: 700; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Consulta de Faturas</h1>
    <p class="lead">Informe seu CPF ou CNPJ (apenas números) para consultar as faturas em aberto.</p>
    <form id="f" autocomplete="off">
      <input type="text" inputmode="numeric" id="documento" placeholder="CPF ou CNPJ" required>
      <button type="submit">Consultar</button>
    </form>
    <p id="status" role="status" aria-live="polite"></p>
    <ul id="lista"></ul>
  </div>
  <script>
  (function () {
    var form = document.getElementById('f');
    var status = document.getElementById('status');
    var lista = document.getElementById('lista');

    function formatarMoeda(v) {
      try { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
      catch (e) { return 'R$ ' + v; }
    }
    function formatarData(iso) {
      if (!iso) return '-';
      var p = String(iso).split('-');
      return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
    }
    function render(items) {
      lista.innerHTML = '';
      if (!items.length) { status.textContent = 'Nenhuma fatura em aberto encontrada para este documento.'; return; }
      status.textContent = items.length + ' fatura(s) encontrada(s).';
      items.forEach(function (item) {
        var li = document.createElement('li');
        var boletoHtml = item.boleto ? ' &middot; <a href="' + item.boleto + '" target="_blank" rel="noopener">Ver boleto</a>' : '';
        li.innerHTML = '<strong>' + (item.descricao || 'Fatura') + '</strong><br>' +
          'Vencimento: ' + formatarData(item.vencimento) + ' &middot; ' + formatarMoeda(item.valor) +
          ' &middot; ' + (item.status || '') + boletoHtml;
        lista.appendChild(li);
      });
    }

    form.addEventListener('submit', function (evt) {
      evt.preventDefault();
      var documento = document.getElementById('documento').value.replace(/\\D/g, '');
      if (!documento) return;
      lista.innerHTML = '';
      status.textContent = 'Consultando...';
      fetch('/api/faturas?documento=' + encodeURIComponent(documento))
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error(data && data.error ? data.error : 'Erro ao consultar.');
            return data;
          });
        })
        .then(function (data) { render(data.items || []); })
        .catch(function (err) { status.textContent = err.message || 'Não foi possível consultar as faturas agora.'; });
    });
  })();
  </script>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders(env) });
    }

    if (url.pathname !== "/api/faturas") {
      return new Response(paginaConsulta(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const documento = (url.searchParams.get("documento") || "").replace(/\D/g, "");
    if (!documento) {
      return json({ error: "Informe o parâmetro documento (CPF ou CNPJ, apenas números)." }, 400, env);
    }

    if (!env.CORA_CLIENT_ID || !env.CORA_MTLS) {
      // Certificado/chave/client_id ainda não configurados neste deploy.
      return json({ error: "Integração com a Cora ainda não configurada neste ambiente." }, 503, env);
    }

    try {
      const { apiHost } = hosts(env);
      const token = await getToken(env);

      const res = await env.CORA_MTLS.fetch(
        `https://${apiHost}/v2/invoices/?state=OPEN&search=${encodeURIComponent(documento)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        throw new Error(`Falha ao consultar faturas (status ${res.status})`);
      }

      const invoices = await res.json();
      const list = Array.isArray(invoices) ? invoices : invoices.items || invoices.data || [];
      return json({ items: list.map(mapInvoice) }, 200, env);
    } catch (err) {
      console.error("Erro ao consultar a Cora:", err);
      return json({ error: "Não foi possível consultar as faturas na Cora agora." }, 502, env);
    }
  },
};
