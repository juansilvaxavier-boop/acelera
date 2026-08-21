import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual, ehAdmin } from "@/lib/auth";
import { ClienteForm } from "../cliente-form";
import { atualizarCliente } from "../actions";
import { VisitaForm } from "./visita-form";
import { VisitaRow } from "./visita-row";
import { OportunidadeForm } from "./oportunidade-form";
import { OportunidadeRow } from "./oportunidade-row";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  const admin = ehAdmin(colaborador);

  const { data: cliente } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
  if (!cliente) notFound();

  const [{ data: vendedores }, { data: visitas }, { data: oportunidades }] = await Promise.all([
    supabase.from("colaboradores").select("id, nome").in("cargo", ["vendedor", "supervisor"]).order("nome"),
    supabase.from("visitas").select("*, colaboradores(nome)").eq("cliente_id", id).order("data_visita", { ascending: false }),
    supabase.from("oportunidades").select("*").eq("cliente_id", id).order("criado_em", { ascending: false }),
  ]);

  const podeEditar = (vendedorId: string) => admin || vendedorId === colaborador?.id;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{cliente.nome}</h1>
        <p className="text-sm text-slate-500">{cliente.propriedade ?? "Sem propriedade cadastrada"}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Dados do cliente</h2>
        <ClienteForm
          action={atualizarCliente.bind(null, id)}
          cliente={cliente}
          vendedores={vendedores ?? []}
          submitLabel="Salvar alterações"
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Oportunidades</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Estágio</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Safra</th>
                <th className="px-4 py-2 font-medium">Previsão</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(oportunidades ?? []).map((o) => (
                <OportunidadeRow
                  key={o.id}
                  oportunidade={o}
                  clienteId={id}
                  vendedores={vendedores ?? []}
                  podeEditar={podeEditar(o.vendedor_id)}
                />
              ))}
              {(oportunidades ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
                    Nenhuma oportunidade registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <OportunidadeForm clienteId={id} vendedores={vendedores ?? []} vendedorPadraoId={colaborador?.id} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Visitas</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Data</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Vendedor</th>
                <th className="px-4 py-2 font-medium">Produto recomendado</th>
                <th className="px-4 py-2 font-medium">Próximo follow-up</th>
                <th className="px-4 py-2 font-medium">Anotações</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(visitas ?? []).map((v) => (
                <VisitaRow
                  key={v.id}
                  visita={v}
                  clienteId={id}
                  vendedores={vendedores ?? []}
                  podeEditar={podeEditar(v.vendedor_id)}
                />
              ))}
              {(visitas ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-slate-400">
                    Nenhuma visita registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <VisitaForm clienteId={id} vendedores={vendedores ?? []} vendedorPadraoId={colaborador?.id} />
      </section>
    </div>
  );
}
