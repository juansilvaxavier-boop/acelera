"use client";

import { useRef } from "react";
import Link from "next/link";
import { moverEstagio } from "./actions";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/crm";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function KanbanCard({
  oportunidade,
}: {
  oportunidade: {
    id: string;
    estagio: string;
    valor_estimado: number | null;
    safra: string | null;
    cliente_nome: string;
    cliente_id: string;
    vendedor_nome: string;
  };
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <Link href={`/clientes/${oportunidade.cliente_id}`} className="text-sm font-medium text-emerald-700 hover:underline">
        {oportunidade.cliente_nome}
      </Link>
      <p className="mt-1 text-xs text-slate-500">{oportunidade.vendedor_nome}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {oportunidade.valor_estimado ? formatBRL(Number(oportunidade.valor_estimado)) : "—"}
      </p>
      {oportunidade.safra && <p className="text-xs text-slate-500">Safra {oportunidade.safra}</p>}

      <form ref={formRef} action={moverEstagio} className="mt-2">
        <input type="hidden" name="oportunidade_id" value={oportunidade.id} />
        <select
          name="estagio"
          defaultValue={oportunidade.estagio}
          onChange={() => formRef.current?.requestSubmit()}
          className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          {ESTAGIOS.map((e) => (
            <option key={e} value={e}>{ESTAGIO_LABEL[e]}</option>
          ))}
        </select>
      </form>
    </div>
  );
}
