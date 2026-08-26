// api/test-cora-env.js — TEMPORÁRIO, só para confirmar quais variáveis da
// Cora já estão configuradas na Vercel. Nunca expõe os valores, só presença.
// Remover logo depois do teste.

module.exports = async (req, res) => {
  res.status(200).json({
    CORA_CLIENT_ID: !!process.env.CORA_CLIENT_ID,
    CORA_CERT: !!process.env.CORA_CERT,
    CORA_KEY: !!process.env.CORA_KEY,
    CORA_ENV: process.env.CORA_ENV || "(não definido, padrão production)",
  });
};
