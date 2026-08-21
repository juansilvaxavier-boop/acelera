import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type ColaboradorAtual = Tables<"colaboradores">;

export async function getColaboradorAtual(): Promise<ColaboradorAtual | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export function ehAdmin(colaborador: ColaboradorAtual | null) {
  return colaborador?.cargo === "gerente" || colaborador?.cargo === "administrativo";
}

export function ehSupervisor(colaborador: ColaboradorAtual | null) {
  return colaborador?.cargo === "supervisor";
}
