import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service role key — só pode ser usado em código server-only
 * (Server Actions/Route Handlers), nunca importado por um componente cliente.
 * Necessário para operações administrativas de Auth (convidar/criar usuários).
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione essa variável de ambiente " +
        "(runtime — Settings > Variables & Secrets no Cloudflare, nunca com prefixo NEXT_PUBLIC_) " +
        "para habilitar o convite de usuários pelo painel."
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
