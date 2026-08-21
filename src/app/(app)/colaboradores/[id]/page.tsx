import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual, ehAdmin } from "@/lib/auth";
import { ColaboradorForm } from "../colaborador-form";
import { atualizarColaborador } from "../actions";
import { adicionarDocumento, removerDocumento } from "./documentos-actions";
import { adicionarPagamento, removerPagamento } from "./pagamentos-actions";
import { hojeISO, daquiADiasISO } from "@/lib/datas";

const TIPOS_DOC = ["contrato", "rg", "cpf", "cnh", "exame_admissional", "exame_periodico", "outro"];
const TIPOS_PAGAMENTO = ["salario", "comissao", "adiantamento", "plr", "outro"];

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ColaboradorDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const atual = await getColaboradorAtual();
  const admin = ehAdmin(atual);

  const { data: colaborador } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!colaborador) notFound();

  const [{ data: supervisores }, { data: documentos }, { data: pagamentos }] = await Promise.all([
    supabase
      .from("colaboradores")
      .select("id, nome")
      .in("cargo", ["supervisor", "gerente", "administrativo"])
      .neq("id", id)
      .order("nome"),
    supabase
      .from("documentos_colaborador")
      .select("*")
      .eq("colaborador_id", id)
      .order("data_vencimento", { ascending: true, nullsFirst: false }),
    supabase
      .from("pagamentos_colaborador")
      .select("*")
      .eq("colaborador_id", id)
      .order("data_referencia", { ascending: false }),
  ]);

  const updateAction = atualizarColaborador.bind(null, id);
  const addDocumento = adicionarDocumento.bind(null, id);
  const addPagamento = adicionarPagamento.bind(null, id);

  const hoje = hojeISO();
  const em30dias = daquiADiasISO(30);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{colaborador.nome}</h1>
        <p className="text-sm text-slate-500 capitalize">{colaborador.cargo}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Dados cadastrais</h2>
        {admin ? (
          <ColaboradorForm
            action={updateAction}
            colaborador={colaborador}
            supervisores={supervisores ?? []}
            submitLabel="Salvar alterações"
          />
        ) : (
          <dl className="grid max-w-xl grid-cols-2 gap-3 text-sm">
            <dt className="text-slate-500">CPF</dt>
            <dd className="text-slate-800">{colaborador.cpf}</dd>
            <dt className="text-slate-500">Vínculo</dt>
            <dd className="text-slate-800">{colaborador.tipo_vinculo}</dd>
            <dt className="text-slate-500">Status</dt>
            <dd className="text-slate-800 capitalize">{colaborador.status}</dd>
            <dt className="text-slate-500">E-mail</dt>
            <dd className="text-slate-800">{colaborador.email ?? "—"}</dd>
            <dt className="text-slate-500">Telefone</dt>
            <dd className="text-slate-800">{colaborador.telefone ?? "—"}</dd>
          </dl>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Documentos</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Emissão</th>
                <th className="px-4 py-2 font-medium">Vencimento</th>
                <th className="px-4 py-2 font-medium">Arquivo</th>
                {admin && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody>
              {(documentos ?? []).map((d) => {
                const vencendo = d.data_vencimento && d.data_vencimento <= em30dias;
                const vencido = d.data_vencimento && d.data_vencimento < hoje;
                return (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 capitalize">{d.tipo.replace(/_/g, " ")}</td>
                    <td className="px-4 py-2">{d.data_emissao ?? "—"}</td>
                    <td className={`px-4 py-2 ${vencido ? "text-red-600" : vencendo ? "text-amber-600" : ""}`}>
                      {d.data_vencimento ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      {d.arquivo_url ? (
                        <a href={d.arquivo_url} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                          abrir
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    {admin && (
                      <td className="px-4 py-2 text-right">
                        <form action={removerDocumento.bind(null, id, d.id)}>
                          <button className="text-xs text-red-600 hover:underline">remover</button>
                        </form>
                      </td>
                    )}
                  </tr>
                );
              })}
              {(documentos ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
                    Nenhum documento cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {admin && (
          <form action={addDocumento} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Tipo</label>
              <select name="tipo" required className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                {TIPOS_DOC.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Link do arquivo (Drive)</label>
              <input name="arquivo_url" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Emissão</label>
              <input type="date" name="data_emissao" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Vencimento</label>
              <input type="date" name="data_vencimento" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <button type="submit" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
              Adicionar
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Pagamentos</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Referência</th>
                <th className="px-4 py-2 font-medium">Valor</th>
                <th className="px-4 py-2 font-medium">Ref. externa (ERP)</th>
                {admin && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody>
              {(pagamentos ?? []).map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 capitalize">{p.tipo}</td>
                  <td className="px-4 py-2">{p.data_referencia}</td>
                  <td className="px-4 py-2">{formatBRL(Number(p.valor))}</td>
                  <td className="px-4 py-2 text-slate-500">{p.referencia_externa ?? "—"}</td>
                  {admin && (
                    <td className="px-4 py-2 text-right">
                      <form action={removerPagamento.bind(null, id, p.id)}>
                        <button className="text-xs text-red-600 hover:underline">remover</button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {(pagamentos ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
                    Nenhum pagamento lançado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {admin && (
          <form action={addPagamento} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">Tipo</label>
              <select name="tipo" required className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                {TIPOS_PAGAMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Valor (R$)</label>
              <input type="number" step="0.01" name="valor" required className="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Data de referência</label>
              <input type="date" name="data_referencia" required className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Ref. externa (ERP)</label>
              <input name="referencia_externa" placeholder="opcional" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
            </div>
            <button type="submit" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
              Lançar
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
