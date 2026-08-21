import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual, ehAdmin, ehSupervisor } from "@/lib/auth";
import { hojeISO, daquiADiasISO } from "@/lib/datas";
import Link from "next/link";

const ESTAGIOS_ABERTOS = [
  "prospeccao",
  "visita_tecnica",
  "proposta",
  "negociacao",
  "entrega",
  "pos_venda",
];

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function HomePage() {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  const admin = ehAdmin(colaborador);
  const supervisor = ehSupervisor(colaborador);
  const verPorVendedor = admin || supervisor;

  const hoje = hojeISO();
  const em30dias = daquiADiasISO(30);

  const [{ data: visitas }, { data: oportunidades }, { data: followupsAtrasados }] =
    await Promise.all([
      supabase.from("visitas").select("id, vendedor_id, colaboradores!visitas_vendedor_id_fkey(nome)"),
      supabase
        .from("oportunidades")
        .select("id, vendedor_id, estagio, valor_estimado, colaboradores!oportunidades_vendedor_id_fkey(nome)"),
      supabase
        .from("visitas")
        .select("id, cliente_id, proximo_followup, clientes(nome)")
        .lt("proximo_followup", hoje)
        .order("proximo_followup", { ascending: true })
        .limit(10),
    ]);

  const abertas = (oportunidades ?? []).filter((o) =>
    ESTAGIOS_ABERTOS.includes(o.estagio)
  );
  const valorPipeline = abertas.reduce((acc, o) => acc + Number(o.valor_estimado ?? 0), 0);

  let documentosVencendo: { id: string; tipo: string; data_vencimento: string | null; colaboradores: { nome: string } | null }[] = [];
  if (admin) {
    const { data } = await supabase
      .from("documentos_colaborador")
      .select("id, tipo, data_vencimento, colaboradores(nome)")
      .not("data_vencimento", "is", null)
      .lte("data_vencimento", em30dias)
      .order("data_vencimento", { ascending: true })
      .limit(10);
    documentosVencendo = (data as typeof documentosVencendo) ?? [];
  }

  const porVendedor = new Map<
    string,
    { nome: string; visitas: number; abertas: number; valor: number }
  >();
  for (const v of visitas ?? []) {
    const nome = (v.colaboradores as { nome: string } | null)?.nome ?? "—";
    const entry = porVendedor.get(v.vendedor_id) ?? { nome, visitas: 0, abertas: 0, valor: 0 };
    entry.visitas += 1;
    porVendedor.set(v.vendedor_id, entry);
  }
  for (const o of abertas) {
    const nome = (o.colaboradores as { nome: string } | null)?.nome ?? "—";
    const entry = porVendedor.get(o.vendedor_id) ?? { nome, visitas: 0, abertas: 0, valor: 0 };
    entry.abertas += 1;
    entry.valor += Number(o.valor_estimado ?? 0);
    porVendedor.set(o.vendedor_id, entry);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Olá, {colaborador?.nome?.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500">Visão geral do seu funil comercial</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Visitas registradas</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{visitas?.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Oportunidades abertas</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{abertas.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Valor em pipeline</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {formatBRL(valorPipeline)}
          </p>
        </div>
      </div>

      {verPorVendedor && porVendedor.size > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Por vendedor</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1 font-medium">Vendedor</th>
                <th className="py-1 font-medium">Visitas</th>
                <th className="py-1 font-medium">Oport. abertas</th>
                <th className="py-1 font-medium">Valor pipeline</th>
              </tr>
            </thead>
            <tbody>
              {[...porVendedor.values()].map((v) => (
                <tr key={v.nome} className="border-t border-slate-100">
                  <td className="py-1.5 text-slate-800">{v.nome}</td>
                  <td className="py-1.5 text-slate-800">{v.visitas}</td>
                  <td className="py-1.5 text-slate-800">{v.abertas}</td>
                  <td className="py-1.5 text-slate-800">{formatBRL(v.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900">Follow-ups atrasados</h2>
          {followupsAtrasados && followupsAtrasados.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-amber-900">
              {followupsAtrasados.map((f) => (
                <li key={f.id}>
                  <Link href={`/clientes/${f.cliente_id}`} className="underline">
                    {(f.clientes as { nome: string } | null)?.nome ?? "Cliente"}
                  </Link>{" "}
                  — venceu em {f.proximo_followup}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-amber-800">Nenhum follow-up atrasado.</p>
          )}
        </div>

        {admin && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="text-sm font-semibold text-red-900">
              Documentos vencendo (≤30 dias)
            </h2>
            {documentosVencendo.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm text-red-900">
                {documentosVencendo.map((d) => (
                  <li key={d.id}>
                    {d.colaboradores?.nome ?? "Colaborador"} — {d.tipo} vence em{" "}
                    {d.data_vencimento}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-red-800">Nenhum documento vencendo.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
