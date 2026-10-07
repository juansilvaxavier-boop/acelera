// api/_lib/session.js
//
// Sessão de cliente assinada (HMAC-SHA256) guardada em cookie httpOnly.
// Não depende de nenhuma lib externa — usa só o módulo "crypto" do Node.
// O cookie nunca é lido nem editável pelo JS do navegador, então o
// CPF/CNPJ usado para consultar faturas (api/faturas.js) vem sempre do
// servidor, nunca de um valor que o cliente poderia forjar na URL.

const crypto = require("crypto");

const COOKIE_NAME = "acelera_cliente";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET não configurado nas variáveis de ambiente do projeto.");
  }
  return secret;
}

function toBase64Url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signBody(body) {
  return toBase64Url(crypto.createHmac("sha256", getSecret()).update(body).digest());
}

function sign(payload) {
  const body = toBase64Url(Buffer.from(JSON.stringify(payload), "utf8"));
  return body + "." + signBody(body);
}

function verify(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let expected;
  try {
    expected = signBody(body);
  } catch (e) {
    return null;
  }
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch (e) {
    return null;
  }
  if (!payload || typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
  return payload;
}

function parseCookies(req) {
  const header = req.headers && req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(";").forEach(function (pair) {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function getSession(req) {
  const cookies = parseCookies(req);
  return verify(cookies[COOKIE_NAME]);
}

function setSessionCookie(res, cliente) {
  const payload = {
    id: cliente.id,
    cpf_cnpj: cliente.cpf_cnpj,
    nome: cliente.nome,
    exp: Date.now() + MAX_AGE_SECONDS * 1000,
  };
  const token = sign(payload);
  const isProd = process.env.VERCEL_ENV !== "development";
  const cookie =
    COOKIE_NAME + "=" + encodeURIComponent(token) +
    "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + MAX_AGE_SECONDS +
    (isProd ? "; Secure" : "");
  res.setHeader("Set-Cookie", cookie);
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", COOKIE_NAME + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

module.exports = { getSession, setSessionCookie, clearSessionCookie };
