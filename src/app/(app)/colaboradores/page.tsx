import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual, ehAdmin } from "@/lib/auth";
import { daquiADiasISO } from "@/lib/datas";

const CARGOS = ["vendedor", "supervisor", "gerente", "terceiro", "motorista", "administrativo"];
const STATUSES = ["ativo", "inativo", "afastado"];

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ cargo?: string; status?: string; vencendo?: string }>;
}) {
  const colaborador = await getColaboradorAtual();
  const admin = ehAdmin(colaborador);
  const params = await searchParams;

  if (!admin) {
    return <p className="text-sm text-slate-600">Acesso restrito a gerência/administrativo.</p>;
  }

  const supabase = await createClient();

  let idsComVencimento: string[] | null = null;
  if (params.vencendo === "1") {
    const em30dias = daquiADiasISO(30);
    const { data } = await supabase
      .from("documentos_colaborador")
      .select("colaborador_id")
      .not("data_vencimento", "is", null)
      .lte("data_vencimento", em30dias);
    idsComVencimento = [...new Set((data ?? []).map((d) => d.colaborador_id))];
  }

  let query = supabase
    .from("colaboradores")
    .select("id, nome, cargo, status, tipo_vinculo, email, telefone")
    .order("nome");

  if (params.cargo) query = query.eq("cargo", params.cargo);
  if (params.status) query = query.eq("status", params.status);
  if (idsComVencimento) query = query.in("id", idsComVencimento.length ? idsComVencimento : ["00000000-0000-0000-0000-000000000000"]);

  const { data: colaboradores } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Colaboradores</h1>
        <Link
          href="/colaboradores/novo"
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + Novo colaborador
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Cargo</label>
          <select name="cargo" defaultValue={params.cargo ?? ""} className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {CARGOS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Status</label>
          <select name="status" defaultValue={params.status ?? ""} className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="vencendo" value="1" defaultChecked={params.vencendo === "1"} />
          Com documento vencendo em 30 dias
        </label>
        <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Cargo</th>
              <th className="px-4 py-2 font-medium">Vínculo</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Contato</th>
            </tr>
          </thead>
          <tbody>
            {(colaboradores ?? []).map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/colaboradores/${c.id}`} className="text-emerald-700 hover:underline">
                    {c.nome}
                  </Link>
                </td>
                <td className="px-4 py-2 capitalize">{c.cargo}</td>
                <td className="px-4 py-2">{c.tipo_vinculo}</td>
                <td className="px-4 py-2 capitalize">{c.status}</td>
                <td className="px-4 py-2 text-slate-500">{c.email ?? c.telefone ?? "—"}</td>
              </tr>
            ))}
            {(colaboradores ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Nenhum colaborador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
