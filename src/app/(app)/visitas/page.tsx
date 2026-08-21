import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function VisitasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const hoje = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("visitas")
    .select("id, data_visita, tipo, proximo_followup, clientes(id, nome), colaboradores(nome)")
    .order("data_visita", { ascending: false });

  if (params.filtro === "atrasados") {
    query = query.not("proximo_followup", "is", null).lt("proximo_followup", hoje);
  }

  const { data: visitas } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Visitas</h1>
        <div className="flex gap-2 text-sm">
          <Link href="/visitas" className={`rounded-md px-3 py-1.5 ${!params.filtro ? "bg-emerald-600 text-white" : "border border-slate-300"}`}>
            Todas
          </Link>
          <Link href="/visitas?filtro=atrasados" className={`rounded-md px-3 py-1.5 ${params.filtro === "atrasados" ? "bg-emerald-600 text-white" : "border border-slate-300"}`}>
            Follow-up atrasado
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Data</th>
              <th className="px-4 py-2 font-medium">Cliente</th>
              <th className="px-4 py-2 font-medium">Vendedor</th>
              <th className="px-4 py-2 font-medium">Tipo</th>
              <th className="px-4 py-2 font-medium">Próximo follow-up</th>
            </tr>
          </thead>
          <tbody>
            {(visitas ?? []).map((v) => {
              const atrasado = v.proximo_followup && v.proximo_followup < hoje;
              return (
                <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2">{v.data_visita}</td>
                  <td className="px-4 py-2">
                    <Link href={`/clientes/${(v.clientes as { id: string; nome: string } | null)?.id}`} className="text-emerald-700 hover:underline">
                      {(v.clientes as { id: string; nome: string } | null)?.nome ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{(v.colaboradores as { nome: string } | null)?.nome ?? "—"}</td>
                  <td className="px-4 py-2 capitalize">{v.tipo ?? "—"}</td>
                  <td className={`px-4 py-2 ${atrasado ? "font-medium text-red-600" : ""}`}>
                    {v.proximo_followup ?? "—"}
                  </td>
                </tr>
              );
            })}
            {(visitas ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Nenhuma visita encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
