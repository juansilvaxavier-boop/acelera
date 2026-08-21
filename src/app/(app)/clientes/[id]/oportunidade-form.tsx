"use client";

import { useActionState, useEffect, useRef } from "react";
import { adicionarOportunidade } from "./oportunidade-actions";
import { ActionToast } from "@/components/action-toast";
import { ESTAGIOS, ESTAGIO_LABEL } from "@/lib/crm";

export function OportunidadeForm({
  clienteId,
  vendedores,
  vendedorPadraoId,
}: {
  clienteId: string;
  vendedores: { id: string; nome: string }[];
  vendedorPadraoId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(adicionarOportunidade.bind(null, clienteId), { error: "" });

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
    >
      <ActionToast error={state.error} success={state.success} successMessage="Oportunidade adicionada." />
      <div>
        <label className="block text-xs font-medium text-slate-600">Estágio</label>
        <select name="estagio" required className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {ESTAGIOS.map((e) => <option key={e} value={e}>{ESTAGIO_LABEL[e]}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Valor estimado (R$)</label>
        <input type="number" step="0.01" name="valor_estimado" className="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Safra</label>
        <input name="safra" placeholder="2026/2027 verão" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Previsão de fechamento</label>
        <input type="date" name="previsao_fechamento" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Vendedor</label>
        <select name="vendedor_id" defaultValue={vendedorPadraoId} className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
        </select>
      </div>
      <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
        {pending ? "Adicionando..." : "Adicionar"}
      </button>
    </form>
  );
}
