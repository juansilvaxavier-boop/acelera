"use client";

import Link from "next/link";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/crm";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type OportunidadeKanban = {
  id: string;
  estagio: string;
  valor_estimado: number | null;
  safra: string | null;
  cliente_nome: string;
  cliente_id: string;
  vendedor_nome: string;
};

export function KanbanCard({
  oportunidade,
  onMoverEstagio,
}: {
  oportunidade: OportunidadeKanban;
  onMoverEstagio: (estagio: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", oportunidade.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <Link href={`/clientes/${oportunidade.cliente_id}`} className="text-sm font-medium text-emerald-700 hover:underline">
        {oportunidade.cliente_nome}
      </Link>
      <p className="mt-1 text-xs text-slate-500">{oportunidade.vendedor_nome}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {oportunidade.valor_estimado ? formatBRL(Number(oportunidade.valor_estimado)) : "—"}
      </p>
      {oportunidade.safra && <p className="text-xs text-slate-500">Safra {oportunidade.safra}</p>}

      <select
        value={oportunidade.estagio}
        onChange={(e) => onMoverEstagio(e.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
      >
        {ESTAGIOS.map((e) => (
          <option key={e} value={e}>{ESTAGIO_LABEL[e]}</option>
        ))}
      </select>
    </div>
  );
}
