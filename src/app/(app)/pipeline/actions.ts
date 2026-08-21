"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function moverEstagio(formData: FormData) {
  const oportunidadeId = String(formData.get("oportunidade_id") ?? "");
  const estagio = String(formData.get("estagio") ?? "");

  const supabase = await createClient();
  const { error } = await supabase
    .from("oportunidades")
    .update({ estagio })
    .eq("id", oportunidadeId);

  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath("/");
}
