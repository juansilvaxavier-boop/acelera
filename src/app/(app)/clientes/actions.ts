"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

function readCliente(formData: FormData): TablesInsert<"clientes"> {
  const culturasRaw = String(formData.get("culturas") ?? "");
  const areaRaw = String(formData.get("area_hectares") ?? "");
  return {
    tipo_pessoa: String(formData.get("tipo_pessoa") ?? "") as TablesInsert<"clientes">["tipo_pessoa"],
    documento: String(formData.get("documento") ?? ""),
    nome: String(formData.get("nome") ?? ""),
    propriedade: String(formData.get("propriedade") ?? "") || null,
    area_hectares: areaRaw ? Number(areaRaw) : null,
    culturas: culturasRaw
      ? culturasRaw.split(",").map((c) => c.trim()).filter(Boolean)
      : null,
    regiao: String(formData.get("regiao") ?? "") || null,
    vendedor_id: String(formData.get("vendedor_id") ?? "") || null,
  };
}

export async function criarCliente(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .insert(readCliente(formData))
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  redirect(`/clientes/${data.id}`);
}

export async function atualizarCliente(id: string, _prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update(readCliente(formData) as TablesUpdate<"clientes">)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  return { error: "", success: true };
}
