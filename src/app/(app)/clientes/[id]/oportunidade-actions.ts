"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual } from "@/lib/auth";

function lerOportunidade(formData: FormData, vendedorPadrao: string) {
  const valorRaw = String(formData.get("valor_estimado") ?? "");
  return {
    vendedor_id: String(formData.get("vendedor_id") ?? vendedorPadrao),
    estagio: String(formData.get("estagio") ?? "prospeccao"),
    valor_estimado: valorRaw ? Number(valorRaw) : null,
    safra: String(formData.get("safra") ?? "") || null,
    previsao_fechamento: String(formData.get("previsao_fechamento") ?? "") || null,
  };
}

export async function adicionarOportunidade(clienteId: string, _prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  if (!colaborador) return { error: "Usuário sem colaborador vinculado." };

  const { error } = await supabase
    .from("oportunidades")
    .insert({ cliente_id: clienteId, ...lerOportunidade(formData, colaborador.id) });

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
  return { error: "", success: true };
}

export async function atualizarOportunidade(
  clienteId: string,
  oportunidadeId: string,
  _prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  if (!colaborador) return { error: "Usuário sem colaborador vinculado." };

  const { error } = await supabase
    .from("oportunidades")
    .update(lerOportunidade(formData, colaborador.id))
    .eq("id", oportunidadeId);

  if (error) return { error: error.message };

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
  return { error: "", success: true };
}

export async function removerOportunidade(clienteId: string, oportunidadeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("oportunidades").delete().eq("id", oportunidadeId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
}
