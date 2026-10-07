// api/auth/signup.js
//
// Cria a conta do cliente (CPF/CNPJ + senha) e já abre a sessão (cookie).
// POST { nome, cpf_cnpj, email?, password }

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

  const nome = String(body.nome || "").trim();
  const cpfCnpj = String(body.cpf_cnpj || "").trim();
  const email = body.email ? String(body.email).trim() : null;
  const password = String(body.password || "");

  if (!nome || !cpfCnpj || !password) {
    res.status(400).json({ error: "Preencha nome, CPF/CNPJ e senha." });
    return;
  }

  try {
    const rows = await rpc("cliente_signup", {
      p_cpf_cnpj: cpfCnpj,
      p_nome: nome,
      p_email: email,
      p_password: password,
    });
    const cliente = Array.isArray(rows) ? rows[0] : rows;
    if (!cliente) throw new Error("Não foi possível criar a conta.");
    setSessionCookie(res, cliente);
    res.status(200).json({ nome: cliente.nome, cpf_cnpj: cliente.cpf_cnpj });
  } catch (err) {
    console.error("Erro no cadastro de cliente:", err);
    res.status(400).json({ error: err.message || "Não foi possível criar a conta." });
  }
};
