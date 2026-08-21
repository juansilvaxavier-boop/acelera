"use client";

import { useActionState, useEffect, useRef } from "react";
import { adicionarDocumento } from "./documentos-actions";
import { ActionToast } from "@/components/action-toast";

const TIPOS_DOC = ["contrato", "rg", "cpf", "cnh", "exame_admissional", "exame_periodico", "outro"];

export function DocumentoForm({ colaboradorId }: { colaboradorId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    adicionarDocumento.bind(null, colaboradorId),
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
      <ActionToast error={state.error} success={state.success} successMessage="Documento adicionado." />
      <div>
        <label className="block text-xs font-medium text-slate-600">Tipo</label>
        <select name="tipo" required className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {TIPOS_DOC.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Link do arquivo (Drive)</label>
        <input name="arquivo_url" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Emissão</label>
        <input type="date" name="data_emissao" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600">Vencimento</label>
        <input type="date" name="data_vencimento" className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
      </div>
      <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
        {pending ? "Adicionando..." : "Adicionar"}
      </button>
    </form>
  );
}
