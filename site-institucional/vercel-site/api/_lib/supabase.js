// api/_lib/supabase.js
//
// Chama as funções RPC de cadastro/login de clientes (cliente_signup /
// cliente_login) no Supabase, usando só a chave anônima (pública). Isso é
// seguro porque a verificação de senha acontece inteiramente dentro do
// Postgres, numa função SECURITY DEFINER com pgcrypto — a chave anônima
// não tem (e nunca teve) select direto na tabela public.clientes.

const SUPABASE_URL = process.env.SUPABASE_URL || "https://kiuulfkrfvcagyuxwnbg.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdXVsZmtyZnZjYWd5dXh3bmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTcxODcsImV4cCI6MjEwMjg3MzE4N30.X6sim5F0f9K7oIAixs5-OJ5CQedfzlmh4ZBVbiG0_Po";

async function rpc(fn, args) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/rpc/" + fn, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(args),
  });
  let data = null;
  try {
    data = await r.json();
  } catch (e) {
    data = null;
  }
  if (!r.ok) {
    const msg = (data && (data.message || data.hint || data.error_description)) || "Erro ao comunicar com o banco de dados.";
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }
  return data;
}

module.exports = { rpc };
