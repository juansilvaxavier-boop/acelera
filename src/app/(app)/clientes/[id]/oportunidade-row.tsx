"use client";

import { useActionState, useState } from "react";
import { atualizarOportunidade, removerOportunidade } from "./oportunidade-actions";
import { ActionToast } from "@/components/action-toast";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/crm";
import type { Tables } from "@/lib/supabase/types";

function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OportunidadeRow({
  oportunidade,
  clienteId,
  vendedores,
  podeEditar,
}: {
  oportunidade: Tables<"oportunidades">;
  clienteId: string;
  vendedores: { id: string; nome: string }[];
  podeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [state, formAction, pending] = useActionState(
    atualizarOportunidade.bind(null, clienteId, oportunidade.id),
    { error: "" }
  );

  const [estadoTratado, setEstadoTratado] = useState(state);
  if (state !== estadoTratado) {
    setEstadoTratado(state);
    if (state.success) setEditando(false);
  }

  if (!editando) {
    return (
      <tr className="border-t border-slate-100">
        <td className="px-4 py-2">{ESTAGIO_LABEL[oportunidade.estagio] ?? oportunidade.estagio}</td>
        <td className="px-4 py-2">
          {oportunidade.valor_estimado ? formatBRL(Number(oportunidade.valor_estimado)) : "—"}
        </td>
        <td className="px-4 py-2">{oportunidade.safra ?? "—"}</td>
        <td className="px-4 py-2">{oportunidade.previsao_fechamento ?? "—"}</td>
        {podeEditar && (
          <td className="px-4 py-2 text-right whitespace-nowrap">
            <button
              onClick={() => setEditando(true)}
              className="text-xs text-emerald-700 hover:underline"
            >
              editar
            </button>{" "}
            <form action={removerOportunidade.bind(null, clienteId, oportunidade.id)} className="inline">
              <ConfirmSubmitButton
                confirmMessage="Excluir esta oportunidade?"
                className="text-xs text-red-600 hover:underline"
              >
                excluir
              </ConfirmSubmitButton>
            </form>
          </td>
        )}
      </tr>
    );
  }

  return (
    <tr className="border-t border-slate-100 bg-slate-50">
      <td colSpan={5} className="px-4 py-3">
        <ActionToast error={state.error} success={state.success} successMessage="Oportunidade atualizada." />
        <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">Estágio</label>
            <select name="estagio" defaultValue={oportunidade.estagio} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              {ESTAGIOS.map((e) => <option key={e} value={e}>{ESTAGIO_LABEL[e]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Valor estimado (R$)</label>
            <input type="number" step="0.01" name="valor_estimado" defaultValue={oportunidade.valor_estimado ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Safra</label>
            <input name="safra" defaultValue={oportunidade.safra ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Previsão de fechamento</label>
            <input type="date" name="previsao_fechamento" defaultValue={oportunidade.previsao_fechamento ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Vendedor</label>
            <select name="vendedor_id" defaultValue={oportunidade.vendedor_id} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
              {pending ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={() => setEditando(false)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100">
              Cancelar
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
