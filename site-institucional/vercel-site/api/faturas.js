// api/faturas.js
//
// Proxy serverless (Vercel) entre o site da Acelera e a API do Banco Cora.
// Existe porque a autenticação da Cora usa mTLS (certificado + chave privada)
// e essas credenciais NUNCA podem ficar no navegador/frontend — só aqui,
// como variáveis de ambiente do lado do servidor.
//
// Rota exposta ao site: GET /api/faturas?documento=12345678900
// Resposta: { items: [ { id, descricao, vencimento, valor, status, boleto, linhaDigitavel, pix } ] }

const https = require("https");

let cachedToken = null;
let cachedTokenExpiry = 0;

const CORA_ENV = process.env.CORA_ENV || "production"; // "production" | "stage"
const TOKEN_HOST =
  CORA_ENV === "stage"
    ? "matls-clients.api.stage.cora.com.br"
    : "matls-clients.api.cora.com.br";
const API_HOST =
  CORA_ENV === "stage" ? "api.stage.cora.com.br" : "api.cora.com.br";

function pem(value) {
  // Permite colar o certificado/chave como uma linha só (com \n escapado)
  // OU como múltiplas linhas reais — ambos os formatos funcionam.
  return value ? value.replace(/\\n/g, "\n") : value;
}

function getAgent() {
  return new https.Agent({
    cert: pem(process.env.CORA_CERT),
    key: pem(process.env.CORA_KEY),
  });
}

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json;
        try {
          json = data ? JSON.parse(data) : {};
        } catch (e) {
          json = { raw: data };
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(json);
        } else {
          reject({ status: res.statusCode, body: json });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiry) return cachedToken;

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CORA_CLIENT_ID,
  }).toString();

  const result = await httpsRequest(
    {
      hostname: TOKEN_HOST,
      path: "/token",
      method: "POST",
      agent: getAgent(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(params),
      },
    },
    params
  );

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

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const documento = String(req.query.documento || "").replace(/\D/g, "");
  if (!documento) {
    res.status(400).json({ error: "Informe o parâmetro documento (CPF ou CNPJ, apenas números)." });
    return;
  }

  if (!process.env.CORA_CLIENT_ID || !process.env.CORA_CERT || !process.env.CORA_KEY) {
    // Credenciais da Cora ainda não configuradas neste deploy.
    // O frontend trata este 503 caindo de volta para os dados de exemplo.
    res.status(503).json({ error: "Integração com a Cora ainda não configurada neste ambiente." });
    return;
  }

  try {
    const token = await getToken();
    const invoices = await httpsRequest({
      hostname: API_HOST,
      path: `/v2/invoices/?state=OPEN&search=${encodeURIComponent(documento)}`,
      method: "GET",
      agent: getAgent(),
      headers: { Authorization: `Bearer ${token}` },
    });

    const list = Array.isArray(invoices) ? invoices : invoices.items || invoices.data || [];
    res.status(200).json({ items: list.map(mapInvoice) });
  } catch (err) {
    console.error("Erro ao consultar a Cora:", err);
    res.status(502).json({ error: "Não foi possível consultar as faturas na Cora agora." });
  }
};
