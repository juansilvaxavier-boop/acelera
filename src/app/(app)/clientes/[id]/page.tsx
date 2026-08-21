import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual } from "@/lib/auth";
import { ClienteForm } from "../cliente-form";
import { atualizarCliente } from "../actions";
import { adicionarVisita } from "./visita-actions";
import { adicionarOportunidade } from "./oportunidade-actions";
import { ESTAGIOS, ESTAGIO_LABEL, TIPOS_VISITA } from "@/lib/crm";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();

  const { data: cliente } = await supabase.from("clientes").select("*").eq("id", id).maybeSingle();
  if (!cliente) notFound();

  const [{ data: vendedores }, { data: visitas }, { data: oportunidades }] = await Promise.all([
    supabase.from("colaboradores").select("id, nome").in("cargo", ["vendedor", "supervisor"]).order("nome"),
    supabase.from("visitas").select("*, colaboradores(nome)").eq("cliente_id", id).order("data_visita", { ascending: false }),
    supabase.from("oportunidades").select("*").eq("cliente_id", id).order("criado_em", { ascending: false }),
  ]);

  const addVisita = adicionarVisita.bind(null, id);
  const addOportunidade = adicionarOportunidade.bind(null, id);

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
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Estágio</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Safra</th>
                <th className="px-4 py-2 font-medium">Previsão</th>
              </tr>
            </thead>
            <tbody>
              {(oportunidades ?? []).map((o) => (
                <tr key={o.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{ESTAGIO_LABEL[o.estagio] ?? o.estagio}</td>
                  <td className="px-4 py-2">{o.valor_estimado ? formatBRL(Number(o.valor_estimado)) : "—"}</td>
                  <td className="px-4 py-2">{o.safra ?? "—"}</td>
                  <td className="px-4 py-2">{o.previsao_fechamento ?? "—"}</td>
                </tr>
              ))}
              {(oportunidades ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-slate-400">
                    Nenhuma oportunidade registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form action={addOportunidade} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">Estágio</label>
            <select name="estagio" required className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              {ESTAGIOS.map((e) => <option key={e} value={e}>{ESTAGIO_LABEL[e]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Valor estimado (R$)</label>
            <input type="number" step="0.01" name="valor_estimado" className="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Safra</label>
            <input name="safra" placeholder="2026/2027 verão" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Previsão de fechamento</label>
            <input type="date" name="previsao_fechamento" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Vendedor</label>
            <select name="vendedor_id" defaultValue={colaborador?.id} className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              {(vendedores ?? []).map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
          </div>
          <button type="submit" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
            Adicionar
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Visitas</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Data</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Vendedor</th>
                <th className="px-4 py-2 font-medium">Produto recomendado</th>
                <th className="px-4 py-2 font-medium">Próximo follow-up</th>
                <th className="px-4 py-2 font-medium">Anotações</th>
              </tr>
            </thead>
            <tbody>
              {(visitas ?? []).map((v) => (
                <tr key={v.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-2">{v.data_visita}</td>
                  <td className="px-4 py-2 capitalize">{v.tipo ?? "—"}</td>
                  <td className="px-4 py-2">{(v.colaboradores as { nome: string } | null)?.nome ?? "—"}</td>
                  <td className="px-4 py-2">{v.produto_recomendado ?? "—"}</td>
                  <td className="px-4 py-2">{v.proximo_followup ?? "—"}</td>
                  <td className="px-4 py-2 max-w-xs whitespace-pre-wrap text-slate-600">{v.anotacoes ?? "—"}</td>
                </tr>
              ))}
              {(visitas ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-slate-400">
                    Nenhuma visita registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form action={addVisita} className="mt-3 grid max-w-2xl grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">Data da visita</label>
            <input type="date" name="data_visita" required className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Tipo</label>
            <select name="tipo" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              {TIPOS_VISITA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Produto recomendado</label>
            <input name="produto_recomendado" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Próximo follow-up</label>
            <input type="date" name="proximo_followup" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600">Anotações</label>
            <textarea name="anotacoes" rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Vendedor</label>
            <select name="vendedor_id" defaultValue={colaborador?.id} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              {(vendedores ?? []).map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Registrar visita
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
