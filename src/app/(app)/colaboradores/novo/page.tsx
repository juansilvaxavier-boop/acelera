import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual, ehAdmin } from "@/lib/auth";
import { ColaboradorForm } from "../colaborador-form";
import { criarColaborador } from "../actions";

export default async function NovoColaboradorPage() {
  const colaborador = await getColaboradorAtual();
  if (!ehAdmin(colaborador)) {
    return <p className="text-sm text-slate-600">Acesso restrito a gerência/administrativo.</p>;
  }

  const supabase = await createClient();
  const { data: supervisores } = await supabase
    .from("colaboradores")
    .select("id, nome")
    .in("cargo", ["supervisor", "gerente", "administrativo"])
    .order("nome");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Novo colaborador</h1>
      <ColaboradorForm action={criarColaborador} supervisores={supervisores ?? []} submitLabel="Criar colaborador" />
    </div>
  );
}
