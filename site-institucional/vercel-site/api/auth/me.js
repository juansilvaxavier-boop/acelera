// api/auth/me.js
//
// Devolve o cliente da sessão atual (se o cookie for válido), para o
// frontend restaurar o painel de faturas sem precisar logar de novo a
// cada visita.

const { getSession } = require("../_lib/session");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }
  res.status(200).json({ nome: session.nome, cpf_cnpj: session.cpf_cnpj });
};
