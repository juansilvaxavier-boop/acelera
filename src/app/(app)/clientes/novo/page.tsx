import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual } from "@/lib/auth";
import { ClienteForm } from "../cliente-form";
import { criarCliente } from "../actions";

export default async function NovoClientePage() {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();

  const { data: vendedores } = await supabase
    .from("colaboradores")
    .select("id, nome")
    .in("cargo", ["vendedor", "supervisor"])
    .order("nome");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Novo cliente</h1>
      <ClienteForm
        action={criarCliente}
        vendedores={vendedores ?? []}
        vendedorPadraoId={colaborador?.id}
        submitLabel="Criar cliente"
      />
    </div>
  );
}
