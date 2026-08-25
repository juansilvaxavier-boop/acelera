// api/test-email.js — TEMPORÁRIO, só para confirmar que RESEND_API_KEY está
// configurada corretamente na Vercel. Remover logo depois do teste.

const { sendMail } = require("./_lib/mail");

module.exports = async (req, res) => {
  try {
    const result = await sendMail({
      subject: "Teste de envio — site Acelera",
      html: "<p>Este é um e-mail de teste enviado pelo endpoint de diagnóstico <code>/api/test-email</code>, para confirmar que o RESEND_API_KEY está configurado corretamente.</p>",
    });
    res.status(200).json({ ok: true, result: result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message, notConfigured: !!err.notConfigured });
  }
};
