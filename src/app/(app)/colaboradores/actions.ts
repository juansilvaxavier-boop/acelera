"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/types";

function readColaborador(formData: FormData): TablesInsert<"colaboradores"> {
  const supervisorId = String(formData.get("supervisor_id") ?? "");
  return {
    nome: String(formData.get("nome") ?? ""),
    cpf: String(formData.get("cpf") ?? ""),
    cargo: String(formData.get("cargo") ?? "") as TablesInsert<"colaboradores">["cargo"],
    tipo_vinculo: String(
      formData.get("tipo_vinculo") ?? ""
    ) as TablesInsert<"colaboradores">["tipo_vinculo"],
    supervisor_id: supervisorId || null,
    data_admissao: String(formData.get("data_admissao") ?? "") || null,
    status: String(formData.get("status") ?? "ativo") as TablesInsert<"colaboradores">["status"],
    email: String(formData.get("email") ?? "") || null,
    telefone: String(formData.get("telefone") ?? "") || null,
  };
}

export async function criarColaborador(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("colaboradores").insert(readColaborador(formData));

  if (error) return { error: error.message };

  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function atualizarColaborador(
  id: string,
  _prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("colaboradores")
    .update(readColaborador(formData) as TablesUpdate<"colaboradores">)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/colaboradores");
  revalidatePath(`/colaboradores/${id}`);
  return { error: "", success: true };
}
