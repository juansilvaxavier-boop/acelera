"use server";

import { createClient } from "@/lib/supabase/server";

export async function alterarSenha(_prevState: unknown, formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (senha.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (senha !== confirmacao) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) return { error: error.message };
  return { error: "", success: true };
}
