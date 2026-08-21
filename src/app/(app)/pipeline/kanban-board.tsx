"use client";

import { useOptimistic, useState, useTransition } from "react";
import { KanbanCard, type OportunidadeKanban } from "./kanban-card";
import { moverEstagio } from "./actions";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/crm";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function KanbanBoard({ itens }: { itens: OportunidadeKanban[] }) {
  const [, startTransition] = useTransition();
  const [colunaSobre, setColunaSobre] = useState<string | null>(null);
  const [itensOtimistas, aplicarMovimentoOtimista] = useOptimistic(
    itens,
    (state, { id, estagio }: { id: string; estagio: string }) =>
      state.map((i) => (i.id === id ? { ...i, estagio } : i))
  );

  function mover(id: string, estagio: string) {
    startTransition(async () => {
      aplicarMovimentoOtimista({ id, estagio });
      await moverEstagio(id, estagio);
    });
  }

  const porEstagio = new Map<string, OportunidadeKanban[]>();
  for (const e of ESTAGIOS) porEstagio.set(e, []);
  for (const i of itensOtimistas) porEstagio.get(i.estagio)?.push(i);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {ESTAGIOS.map((estagio) => {
        const coluna = porEstagio.get(estagio) ?? [];
        const total = coluna.reduce((acc, o) => acc + Number(o.valor_estimado ?? 0), 0);
        return (
          <div
            key={estagio}
            className="w-64 flex-shrink-0"
            onDragOver={(e) => {
              e.preventDefault();
              setColunaSobre(estagio);
            }}
            onDragLeave={() => setColunaSobre((atual) => (atual === estagio ? null : atual))}
            onDrop={(e) => {
              e.preventDefault();
              setColunaSobre(null);
              const id = e.dataTransfer.getData("text/plain");
              if (id) mover(id, estagio);
            }}
          >
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-slate-900">{ESTAGIO_LABEL[estagio]}</h2>
              <span className="text-xs text-slate-500">{coluna.length}</span>
            </div>
            <p className="mb-2 text-xs text-slate-500">{formatBRL(total)}</p>
            <div
              className={`min-h-[60px] space-y-2 rounded-md p-1 transition-colors ${
                colunaSobre === estagio ? "bg-emerald-50 ring-2 ring-emerald-300" : ""
              }`}
            >
              {coluna.map((o) => (
                <KanbanCard key={o.id} oportunidade={o} onMoverEstagio={(novoEstagio) => mover(o.id, novoEstagio)} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
