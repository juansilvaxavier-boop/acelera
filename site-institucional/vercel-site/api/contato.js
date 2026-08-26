// api/contato.js
//
// Recebe o formulário da página Contato e envia por e-mail para a Acelera.
// POST { nome, email, mensagem }

const { sendMail, escapeHtml } = require("./_lib/mail");

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
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
  const email = String(body.email || "").trim();
  const mensagem = String(body.mensagem || "").trim();

  if (!nome || !email || !mensagem) {
    res.status(400).json({ error: "Preencha nome, e-mail e mensagem." });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Informe um e-mail válido." });
    return;
  }

  const html =
    "<h2>Nova mensagem pelo site — Contato</h2>" +
    "<p><strong>Nome:</strong> " + escapeHtml(nome) + "</p>" +
    "<p><strong>E-mail:</strong> " + escapeHtml(email) + "</p>" +
    "<p><strong>Mensagem:</strong></p><p>" + escapeHtml(mensagem).replace(/\n/g, "<br>") + "</p>";

  try {
    await sendMail({
      subject: "Novo contato pelo site — " + nome,
      html: html,
      replyTo: email,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao enviar e-mail de contato:", err);
    if (err.notConfigured) {
      res.status(503).json({ error: "Envio de e-mail ainda não configurado neste ambiente." });
      return;
    }
    res.status(502).json({ error: "Não foi possível enviar sua mensagem agora. Tente novamente em instantes." });
  }
};
