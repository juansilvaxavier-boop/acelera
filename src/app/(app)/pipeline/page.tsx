import { createClient } from "@/lib/supabase/server";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/crm";
import { KanbanCard } from "./kanban-card";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: oportunidades } = await supabase
    .from("oportunidades")
    .select("id, estagio, valor_estimado, safra, clientes(id, nome), colaboradores(nome)")
    .order("criado_em", { ascending: false });

  const porEstagio = new Map<string, typeof oportunidades>();
  for (const estagio of ESTAGIOS) porEstagio.set(estagio, []);
  for (const o of oportunidades ?? []) {
    porEstagio.get(o.estagio)?.push(o);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Pipeline de vendas</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {ESTAGIOS.map((estagio) => {
          const itens = porEstagio.get(estagio) ?? [];
          const total = itens.reduce((acc, o) => acc + Number(o.valor_estimado ?? 0), 0);
          return (
            <div key={estagio} className="w-64 flex-shrink-0">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-slate-900">{ESTAGIO_LABEL[estagio]}</h2>
                <span className="text-xs text-slate-500">{itens.length}</span>
              </div>
              <p className="mb-2 text-xs text-slate-500">{formatBRL(total)}</p>
              <div className="space-y-2">
                {itens.map((o) => (
                  <KanbanCard
                    key={o.id}
                    oportunidade={{
                      id: o.id,
                      estagio: o.estagio,
                      valor_estimado: o.valor_estimado,
                      safra: o.safra,
                      cliente_nome: (o.clientes as { id: string; nome: string } | null)?.nome ?? "—",
                      cliente_id: (o.clientes as { id: string; nome: string } | null)?.id ?? "",
                      vendedor_nome: (o.colaboradores as { nome: string } | null)?.nome ?? "—",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
