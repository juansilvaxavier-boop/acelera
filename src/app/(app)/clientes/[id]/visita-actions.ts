"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual } from "@/lib/auth";

function lerVisita(formData: FormData, vendedorPadrao: string) {
  return {
    vendedor_id: String(formData.get("vendedor_id") ?? vendedorPadrao),
    data_visita: String(formData.get("data_visita") ?? ""),
    tipo: String(formData.get("tipo") ?? "") || null,
    anotacoes: String(formData.get("anotacoes") ?? "") || null,
    produto_recomendado: String(formData.get("produto_recomendado") ?? "") || null,
    proximo_followup: String(formData.get("proximo_followup") ?? "") || null,
  };
}

export async function adicionarVisita(clienteId: string, _prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  if (!colaborador) return { error: "Usuário sem colaborador vinculado." };

  const { error } = await supabase
    .from("visitas")
    .insert({ cliente_id: clienteId, ...lerVisita(formData, colaborador.id) });

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/visitas");
  revalidatePath("/");
  return { error: "", success: true };
}

export async function atualizarVisita(
  clienteId: string,
  visitaId: string,
  _prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  if (!colaborador) return { error: "Usuário sem colaborador vinculado." };

  const { error } = await supabase
    .from("visitas")
    .update(lerVisita(formData, colaborador.id))
    .eq("id", visitaId);

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/visitas");
  revalidatePath("/");
  return { error: "", success: true };
}

export async function removerVisita(clienteId: string, visitaId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("visitas").delete().eq("id", visitaId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/visitas");
  revalidatePath("/");
}
