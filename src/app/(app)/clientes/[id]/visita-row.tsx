"use client";

import { useActionState, useState } from "react";
import { atualizarVisita, removerVisita } from "./visita-actions";
import { ActionToast } from "@/components/action-toast";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { TIPOS_VISITA } from "@/lib/crm";
import type { Tables } from "@/lib/supabase/types";

type Visita = Tables<"visitas"> & { colaboradores: { nome: string } | null };

export function VisitaRow({
  visita,
  clienteId,
  vendedores,
  podeEditar,
}: {
  visita: Visita;
  clienteId: string;
  vendedores: { id: string; nome: string }[];
  podeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [state, formAction, pending] = useActionState(
    atualizarVisita.bind(null, clienteId, visita.id),
    { error: "" }
  );

  const [estadoTratado, setEstadoTratado] = useState(state);
  if (state !== estadoTratado) {
    setEstadoTratado(state);
    if (state.success) setEditando(false);
  }

  if (!editando) {
    return (
      <tr className="border-t border-slate-100 align-top">
        <td className="px-4 py-2">{visita.data_visita}</td>
        <td className="px-4 py-2 capitalize">{visita.tipo ?? "—"}</td>
        <td className="px-4 py-2">{visita.colaboradores?.nome ?? "—"}</td>
        <td className="px-4 py-2">{visita.produto_recomendado ?? "—"}</td>
        <td className="px-4 py-2">{visita.proximo_followup ?? "—"}</td>
        <td className="px-4 py-2 max-w-xs whitespace-pre-wrap text-slate-600">
          {visita.anotacoes ?? "—"}
        </td>
        {podeEditar && (
          <td className="px-4 py-2 text-right whitespace-nowrap">
            <button
              onClick={() => setEditando(true)}
              className="text-xs text-emerald-700 hover:underline"
            >
              editar
            </button>{" "}
            <form action={removerVisita.bind(null, clienteId, visita.id)} className="inline">
              <ConfirmSubmitButton
                confirmMessage="Excluir esta visita?"
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
      <td colSpan={7} className="px-4 py-3">
        <ActionToast error={state.error} success={state.success} successMessage="Visita atualizada." />
        <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">Data</label>
            <input type="date" name="data_visita" required defaultValue={visita.data_visita} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Tipo</label>
            <select name="tipo" defaultValue={visita.tipo ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              {TIPOS_VISITA.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Vendedor</label>
            <select name="vendedor_id" defaultValue={visita.vendedor_id} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
              {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Produto recomendado</label>
            <input name="produto_recomendado" defaultValue={visita.produto_recomendado ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Próximo follow-up</label>
            <input type="date" name="proximo_followup" defaultValue={visita.proximo_followup ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-medium text-slate-600">Anotações</label>
            <textarea name="anotacoes" rows={2} defaultValue={visita.anotacoes ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div className="flex gap-2 sm:col-span-2 md:col-span-3">
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
