"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual, ehAdmin } from "@/lib/auth";

async function origin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host");
  return `${proto}://${host}`;
}

export async function convidarUsuario(colaboradorId: string, _prevState: unknown, formData: FormData) {
  const atual = await getColaboradorAtual();
  if (!ehAdmin(atual)) return { error: "Acesso restrito a gerência/administrativo." };

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Informe um e-mail." };

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao configurar cliente administrativo." };
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${await origin()}/conta/senha`,
  });

  if (error) return { error: error.message };

  const supabase = await createClient();
  const { error: linkError } = await supabase
    .from("colaboradores")
    .update({ user_id: data.user.id, email })
    .eq("id", colaboradorId);

  if (linkError) return { error: linkError.message };

  revalidatePath(`/colaboradores/${colaboradorId}`);
  return { error: "", success: true };
}
