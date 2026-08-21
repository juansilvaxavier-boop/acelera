import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getColaboradorAtual, ehAdmin, ehSupervisor } from "@/lib/auth";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; regiao?: string }>;
}) {
  const supabase = await createClient();
  const colaborador = await getColaboradorAtual();
  const admin = ehAdmin(colaborador);
  const supervisor = ehSupervisor(colaborador);
  const params = await searchParams;

  let query = supabase
    .from("clientes")
    .select("id, nome, propriedade, regiao, area_hectares, culturas, colaboradores(nome)")
    .order("nome");

  if (params.q) query = query.ilike("nome", `%${params.q}%`);
  if (params.regiao) query = query.ilike("regiao", `%${params.regiao}%`);

  const { data: clientes } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Clientes</h1>
        <Link href="/clientes/novo" className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
          + Novo cliente
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Nome</label>
          <input name="q" defaultValue={params.q ?? ""} className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Região</label>
          <input name="regiao" defaultValue={params.regiao ?? ""} className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
        </div>
        <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Propriedade</th>
              <th className="px-4 py-2 font-medium">Região</th>
              <th className="px-4 py-2 font-medium">Área (ha)</th>
              <th className="px-4 py-2 font-medium">Culturas</th>
              {(admin || supervisor) && <th className="px-4 py-2 font-medium">Vendedor</th>}
            </tr>
          </thead>
          <tbody>
            {(clientes ?? []).map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/clientes/${c.id}`} className="text-emerald-700 hover:underline">
                    {c.nome}
                  </Link>
                </td>
                <td className="px-4 py-2">{c.propriedade ?? "—"}</td>
                <td className="px-4 py-2">{c.regiao ?? "—"}</td>
                <td className="px-4 py-2">{c.area_hectares ?? "—"}</td>
                <td className="px-4 py-2">{c.culturas?.join(", ") ?? "—"}</td>
                {(admin || supervisor) && (
                  <td className="px-4 py-2">{(c.colaboradores as { nome: string } | null)?.nome ?? "—"}</td>
                )}
              </tr>
            ))}
            {(clientes ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
