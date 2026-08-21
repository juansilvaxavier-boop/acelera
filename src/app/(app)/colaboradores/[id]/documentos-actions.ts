"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adicionarDocumento(colaboradorId: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("documentos_colaborador").insert({
    colaborador_id: colaboradorId,
    tipo: String(formData.get("tipo") ?? ""),
    arquivo_url: String(formData.get("arquivo_url") ?? "") || null,
    data_emissao: String(formData.get("data_emissao") ?? "") || null,
    data_vencimento: String(formData.get("data_vencimento") ?? "") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/colaboradores/${colaboradorId}`);
}

export async function removerDocumento(colaboradorId: string, documentoId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("documentos_colaborador").delete().eq("id", documentoId);
  if (error) throw new Error(error.message);
  revalidatePath(`/colaboradores/${colaboradorId}`);
}
