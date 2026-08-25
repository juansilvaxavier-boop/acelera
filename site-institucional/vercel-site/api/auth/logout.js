// api/auth/logout.js
//
// Encerra a sessão do cliente (limpa o cookie).

const { clearSessionCookie } = require("../_lib/session");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
};
