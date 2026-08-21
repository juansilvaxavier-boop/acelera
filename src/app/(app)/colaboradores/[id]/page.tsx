import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual, ehAdmin } from "@/lib/auth";
import { ColaboradorForm } from "../colaborador-form";
import { atualizarColaborador } from "../actions";
import { removerDocumento } from "./documentos-actions";
import { removerPagamento } from "./pagamentos-actions";
import { DocumentoForm } from "./documento-form";
import { PagamentoForm } from "./pagamento-form";
import { ConviteUsuario } from "./convite-usuario";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { hojeISO, daquiADiasISO } from "@/lib/datas";

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

      {admin && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Acesso ao sistema</h2>
          <ConviteUsuario
            colaboradorId={id}
            emailAtual={colaborador.email}
            jaVinculado={!!colaborador.user_id}
          />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Documentos</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
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
                          <ConfirmSubmitButton
                            confirmMessage="Remover este documento?"
                            className="text-xs text-red-600 hover:underline"
                          >
                            remover
                          </ConfirmSubmitButton>
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

        {admin && <DocumentoForm colaboradorId={id} />}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Pagamentos</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-sm">
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
                        <ConfirmSubmitButton
                          confirmMessage="Remover este pagamento?"
                          className="text-xs text-red-600 hover:underline"
                        >
                          remover
                        </ConfirmSubmitButton>
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

        {admin && <PagamentoForm colaboradorId={id} />}
      </section>
    </div>
  );
}
