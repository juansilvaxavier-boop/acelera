"use client";

import { useActionState, useEffect, useRef } from "react";
import { adicionarVisita } from "./visita-actions";
import { ActionToast } from "@/components/action-toast";
import { TIPOS_VISITA } from "@/lib/crm";

export function VisitaForm({
  clienteId,
  vendedores,
  vendedorPadraoId,
}: {
  clienteId: string;
  vendedores: { id: string; nome: string }[];
  vendedorPadraoId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(adicionarVisita.bind(null, clienteId), { error: "" });

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-3 grid max-w-2xl grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2"
    >
      <ActionToast error={state.error} success={state.success} successMessage="Visita registrada." />
      <div>
        <label className="block text-xs font-medium text-slate-600">Data da visita</label>
        <input type="date" name="data_visita" required className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Tipo</label>
        <select name="tipo" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {TIPOS_VISITA.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Produto recomendado</label>
        <input name="produto_recomendado" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Próximo follow-up</label>
        <input type="date" name="proximo_followup" className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-slate-600">Anotações</label>
        <textarea name="anotacoes" rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Vendedor</label>
        <select name="vendedor_id" defaultValue={vendedorPadraoId} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
          {pending ? "Registrando..." : "Registrar visita"}
        </button>
      </div>
    </form>
  );
}
