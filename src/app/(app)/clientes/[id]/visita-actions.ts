"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual } from "@/lib/auth";

export async function adicionarVisita(clienteId: string, formData: FormData) {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  if (!colaborador) throw new Error("Usuário sem colaborador vinculado.");

  const vendedorId = String(formData.get("vendedor_id") ?? colaborador.id);

  const { error } = await supabase.from("visitas").insert({
    cliente_id: clienteId,
    vendedor_id: vendedorId,
    data_visita: String(formData.get("data_visita") ?? ""),
    tipo: String(formData.get("tipo") ?? "") || null,
    anotacoes: String(formData.get("anotacoes") ?? "") || null,
    produto_recomendado: String(formData.get("produto_recomendado") ?? "") || null,
    proximo_followup: String(formData.get("proximo_followup") ?? "") || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/visitas");
  revalidatePath("/");
}
