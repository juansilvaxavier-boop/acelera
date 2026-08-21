"use client";

import { useActionState, useEffect, useRef } from "react";
import { adicionarPagamento } from "./pagamentos-actions";
import { ActionToast } from "@/components/action-toast";

const TIPOS_PAGAMENTO = ["salario", "comissao", "adiantamento", "plr", "outro"];

export function PagamentoForm({ colaboradorId }: { colaboradorId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    adicionarPagamento.bind(null, colaboradorId),
    { error: "" }
  );

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
    >
      <ActionToast error={state.error} success={state.success} successMessage="Pagamento lançado." />
      <div>
        <label className="block text-xs font-medium text-slate-600">Tipo</label>
        <select name="tipo" required className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {TIPOS_PAGAMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Valor (R$)</label>
        <input type="number" step="0.01" name="valor" required className="mt-1 w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Data de referência</label>
        <input type="date" name="data_referencia" required className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Ref. externa (ERP)</label>
        <input name="referencia_externa" placeholder="opcional" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
        {pending ? "Lançando..." : "Lançar"}
      </button>
    </form>
  );
}
