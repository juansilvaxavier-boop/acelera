// api/heartbeat.js
//
// Mantém o projeto Supabase "aceso": o plano gratuito pausa o projeto após
// ~7 dias sem nenhuma requisição à API REST. Esta rota é chamada
// automaticamente todo dia pelo Vercel Cron (veja vercel.json) e faz uma
// única leitura leve, só para contar como atividade.

const SUPABASE_URL = process.env.SUPABASE_URL || "https://kiuulfkrfvcagyuxwnbg.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdXVsZmtyZnZjYWd5dXh3bmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTcxODcsImV4cCI6MjEwMjg3MzE4N30.X6sim5F0f9K7oIAixs5-OJ5CQedfzlmh4ZBVbiG0_Po";

module.exports = async (req, res) => {
  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/product_lines?select=id&limit=1", {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY },
    });
    res.status(200).json({ ok: true, supabaseStatus: r.status });
  } catch (err) {
    console.error("Heartbeat falhou ao alcançar o Supabase:", err);
    res.status(200).json({ ok: false, error: String(err) });
  }
};
