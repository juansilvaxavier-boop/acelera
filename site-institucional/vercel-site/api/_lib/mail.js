// api/_lib/mail.js
//
// Envio de e-mail via Resend (https://resend.com) — API HTTP simples, sem
// precisar de servidor SMTP nem senha de app do Gmail. Só depende da
// variável de ambiente RESEND_API_KEY.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM || "Site Acelera <onboarding@resend.dev>";
const MAIL_TO = process.env.MAIL_TO || "admbrindustria@gmail.com";

async function sendMail({ subject, html, replyTo, attachments }) {
  if (!RESEND_API_KEY) {
    const err = new Error("Envio de e-mail ainda não configurado neste ambiente (RESEND_API_KEY ausente).");
    err.notConfigured = true;
    throw err;
  }

  const payload = { from: MAIL_FROM, to: [MAIL_TO], subject: subject, html: html };
  if (replyTo) payload.reply_to = replyTo;
  if (attachments && attachments.length) payload.attachments = attachments;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + RESEND_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await r.json();
  } catch (e) {
    data = null;
  }
  if (!r.ok) {
    const msg = (data && (data.message || data.error)) || "Erro ao enviar e-mail.";
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }
  return data;
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { sendMail, escapeHtml };
