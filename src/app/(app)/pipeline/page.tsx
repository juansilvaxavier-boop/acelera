import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "./kanban-board";
import type { OportunidadeKanban } from "./kanban-card";

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: oportunidades } = await supabase
    .from("oportunidades")
    .select("id, estagio, valor_estimado, safra, clientes(id, nome), colaboradores(nome)")
    .order("criado_em", { ascending: false });

  const itens: OportunidadeKanban[] = (oportunidades ?? []).map((o) => ({
    id: o.id,
    estagio: o.estagio,
    valor_estimado: o.valor_estimado,
    safra: o.safra,
    cliente_nome: (o.clientes as { id: string; nome: string } | null)?.nome ?? "—",
    cliente_id: (o.clientes as { id: string; nome: string } | null)?.id ?? "",
    vendedor_nome: (o.colaboradores as { nome: string } | null)?.nome ?? "—",
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Pipeline de vendas</h1>
      <p className="text-xs text-slate-500 sm:hidden">No celular, use o seletor de estágio no card (arrastar é só no desktop).</p>
      <KanbanBoard itens={itens} />
    </div>
  );
}
