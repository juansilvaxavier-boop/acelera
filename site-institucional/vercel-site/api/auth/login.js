// api/auth/login.js
//
// Autentica o cliente (CPF/CNPJ + senha) e abre a sessão (cookie httpOnly).
// POST { cpf_cnpj, password }

const { rpc } = require("../_lib/supabase");
const { setSessionCookie } = require("../_lib/session");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  body = body || {};

  const cpfCnpj = String(body.cpf_cnpj || "").trim();
  const password = String(body.password || "");

  if (!cpfCnpj || !password) {
    res.status(400).json({ error: "Informe CPF/CNPJ e senha." });
    return;
  }

  try {
    const rows = await rpc("cliente_login", { p_cpf_cnpj: cpfCnpj, p_password: password });
    const cliente = Array.isArray(rows) ? rows[0] : rows;
    if (!cliente) throw new Error("CPF/CNPJ ou senha incorretos.");
    setSessionCookie(res, cliente);
    res.status(200).json({ nome: cliente.nome, cpf_cnpj: cliente.cpf_cnpj });
  } catch (err) {
    res.status(401).json({ error: err.message || "CPF/CNPJ ou senha incorretos." });
  }
};
