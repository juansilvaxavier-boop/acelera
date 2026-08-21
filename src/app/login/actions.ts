"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function origin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host");
  return `${proto}://${host}`;
}

export async function signIn(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "E-mail ou senha inválidos." };
    }
    return { error: `Erro ao entrar: ${error.message}` };
  }

  redirect("/");
}

export async function solicitarRedefinicaoSenha(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/conta/senha`,
  });

  // Sempre retorna sucesso, mesmo se o e-mail não existir, para não revelar quais e-mails têm conta.
  return { error: "", success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
