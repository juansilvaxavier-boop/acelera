"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adicionarPagamento(colaboradorId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("pagamentos_colaborador").insert({
    colaborador_id: colaboradorId,
    tipo: String(formData.get("tipo") ?? ""),
    valor: Number(formData.get("valor") ?? 0),
    data_referencia: String(formData.get("data_referencia") ?? ""),
    referencia_externa: String(formData.get("referencia_externa") ?? "") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/colaboradores/${colaboradorId}`);
}

export async function removerPagamento(colaboradorId: string, pagamentoId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pagamentos_colaborador").delete().eq("id", pagamentoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/colaboradores/${colaboradorId}`);
}
