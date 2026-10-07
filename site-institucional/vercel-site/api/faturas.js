// api/faturas.js
//
// Proxy serverless (Vercel) entre o site da Acelera e a API do Banco Cora.
// Existe porque a autenticação da Cora usa mTLS (certificado + chave privada)
// e essas credenciais NUNCA podem ficar no navegador/frontend — só aqui,
// como variáveis de ambiente do lado do servidor.
//
// O CPF/CNPJ consultado vem SEMPRE da sessão do cliente autenticado (cookie
// httpOnly criado em /api/auth/login ou /api/auth/signup) — nunca de um
// parâmetro que o navegador poderia enviar, para que ninguém consiga ver
// faturas de outro CPF/CNPJ só trocando um valor na requisição.
//
// Rota exposta ao site: GET /api/faturas  (precisa de sessão válida)
// Resposta: { configured: boolean, items: [ { id, descricao, vencimento, valor, status, boleto, linhaDigitavel, pix } ] }
//
// Enquanto CORA_CLIENT_ID/CORA_CERT/CORA_KEY não estiverem configurados nas
// variáveis de ambiente da Vercel, devolve dados de exemplo com
// configured:false. Assim que essas variáveis forem preenchidas, a mesma
// rota passa a consultar a API real da Cora — sem precisar mudar o frontend.

const https = require("https");
const { getSession } = require("./_lib/session");

let cachedToken = null;
let cachedTokenExpiry = 0;

const CORA_ENV = process.env.CORA_ENV || "production"; // "production" | "stage"
const TOKEN_HOST =
  CORA_ENV === "stage"
    ? "matls-clients.api.stage.cora.com.br"
    : "matls-clients.api.cora.com.br";
const API_HOST =
  CORA_ENV === "stage" ? "api.stage.cora.com.br" : "api.cora.com.br";

const DEMO_ITEMS = [
  { descricao: "Adubo Líquido — 3 tambores", vencimento: "2026-08-10", valor: 2140, status: "PAID", boleto: "#", pix: null },
  { descricao: "Acelera N30 — 5 tambores", vencimento: "2026-08-28", valor: 1780, status: "LATE", boleto: "#", pix: null },
  { descricao: "Gesso Líquido — 2 tambores", vencimento: "2026-09-05", valor: 1480, status: "OPEN", boleto: "#", pix: "00020126giro" },
  { descricao: "Gel de Plantio — 10un", vencimento: "2026-09-18", valor: 1600, status: "OPEN", boleto: "#", pix: "00020126giro" },
];

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
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const session = getSession(req);
  if (!session || !session.cpf_cnpj) {
    res.status(401).json({ error: "É preciso entrar na sua conta para ver as faturas." });
    return;
  }
  const documento = String(session.cpf_cnpj).replace(/\D/g, "");

  if (!process.env.CORA_CLIENT_ID || !process.env.CORA_CERT || !process.env.CORA_KEY) {
    // Credenciais da Cora ainda não configuradas neste deploy: devolve
    // dados de exemplo, já protegidos por sessão, para a tela funcionar
    // de ponta a ponta antes de a integração real estar pronta.
    res.status(200).json({ configured: false, items: DEMO_ITEMS });
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
    res.status(200).json({ configured: true, items: list.map(mapInvoice) });
  } catch (err) {
    console.error("Erro ao consultar a Cora:", err);
    res.status(502).json({ error: "Não foi possível consultar as faturas na Cora agora." });
  }
};
