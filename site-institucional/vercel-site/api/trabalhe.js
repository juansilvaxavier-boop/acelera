// api/trabalhe.js
//
// Recebe o formulário da página Trabalhe conosco e envia por e-mail para a
// Acelera, com o currículo (PDF) anexado quando enviado.
// POST { nome, telefone, email, area, mensagem, curriculo?: { filename, mimeType, contentBase64 } }

const { sendMail, escapeHtml } = require("./_lib/mail");

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Limite defensivo do lado do servidor (o corpo da requisição já é limitado
// pela própria Vercel, mas isso dá uma mensagem de erro mais clara).
const MAX_BASE64_LENGTH = 7 * 1024 * 1024; // ~5MB de PDF em base64

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
  const telefone = String(body.telefone || "").trim();
  const email = String(body.email || "").trim();
  const area = String(body.area || "").trim();
  const mensagem = String(body.mensagem || "").trim();
  const curriculo = body.curriculo && typeof body.curriculo === "object" ? body.curriculo : null;

  if (!nome || !telefone || !email || !area) {
    res.status(400).json({ error: "Preencha nome, telefone, e-mail e área de interesse." });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Informe um e-mail válido." });
    return;
  }
  if (curriculo && curriculo.contentBase64 && curriculo.contentBase64.length > MAX_BASE64_LENGTH) {
    res.status(400).json({ error: "O currículo é muito grande. Envie um PDF de até 5MB." });
    return;
  }

  const html =
    "<h2>Nova candidatura pelo site — Trabalhe conosco</h2>" +
    "<p><strong>Nome:</strong> " + escapeHtml(nome) + "</p>" +
    "<p><strong>Telefone/WhatsApp:</strong> " + escapeHtml(telefone) + "</p>" +
    "<p><strong>E-mail:</strong> " + escapeHtml(email) + "</p>" +
    "<p><strong>Área de interesse:</strong> " + escapeHtml(area) + "</p>" +
    (mensagem ? "<p><strong>Mensagem:</strong></p><p>" + escapeHtml(mensagem).replace(/\n/g, "<br>") + "</p>" : "") +
    (curriculo ? "<p><strong>Currículo:</strong> anexado a este e-mail (" + escapeHtml(curriculo.filename || "curriculo.pdf") + ")</p>" : "<p><strong>Currículo:</strong> não anexado</p>");

  const attachments =
    curriculo && curriculo.contentBase64
      ? [{ filename: curriculo.filename || "curriculo.pdf", content: curriculo.contentBase64 }]
      : undefined;

  try {
    await sendMail({
      subject: "Nova candidatura pelo site — " + nome + " (" + area + ")",
      html: html,
      replyTo: email,
      attachments: attachments,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao enviar e-mail de candidatura:", err);
    if (err.notConfigured) {
      res.status(503).json({ error: "Envio de e-mail ainda não configurado neste ambiente." });
      return;
    }
    res.status(502).json({ error: "Não foi possível enviar sua candidatura agora. Tente novamente em instantes." });
  }
};
