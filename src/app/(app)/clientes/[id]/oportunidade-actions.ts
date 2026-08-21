"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual } from "@/lib/auth";

export async function adicionarOportunidade(clienteId: string, formData: FormData) {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  if (!colaborador) throw new Error("Usuário sem colaborador vinculado.");

  const vendedorId = String(formData.get("vendedor_id") ?? colaborador.id);
  const valorRaw = String(formData.get("valor_estimado") ?? "");

  const { error } = await supabase.from("oportunidades").insert({
    cliente_id: clienteId,
    vendedor_id: vendedorId,
    estagio: String(formData.get("estagio") ?? "prospeccao"),
    valor_estimado: valorRaw ? Number(valorRaw) : null,
    safra: String(formData.get("safra") ?? "") || null,
    previsao_fechamento: String(formData.get("previsao_fechamento") ?? "") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
}
