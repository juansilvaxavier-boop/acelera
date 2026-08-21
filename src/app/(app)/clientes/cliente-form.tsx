"use client";

import { useActionState } from "react";
import type { Tables } from "@/lib/supabase/types";

type Action = (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean } | void>;

export function ClienteForm({
  action,
  cliente,
  vendedores,
  vendedorPadraoId,
  submitLabel,
}: {
  action: Action;
  cliente?: Tables<"clientes">;
  vendedores: { id: string; nome: string }[];
  vendedorPadraoId?: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Nome / Razão social</label>
        <input name="nome" required defaultValue={cliente?.nome} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Tipo</label>
        <select name="tipo_pessoa" required defaultValue={cliente?.tipo_pessoa ?? "CPF"} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="CPF">CPF</option>
          <option value="CNPJ">CNPJ</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Documento</label>
        <input name="documento" required defaultValue={cliente?.documento} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Propriedade (fazenda)</label>
        <input name="propriedade" defaultValue={cliente?.propriedade ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Área (hectares)</label>
        <input type="number" step="0.01" name="area_hectares" defaultValue={cliente?.area_hectares ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Culturas (separadas por vírgula)</label>
        <input name="culturas" defaultValue={cliente?.culturas?.join(", ") ?? ""} placeholder="soja, milho" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Região</label>
        <input name="regiao" defaultValue={cliente?.regiao ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Vendedor responsável</label>
        <select name="vendedor_id" defaultValue={cliente?.vendedor_id ?? vendedorPadraoId ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Selecione</option>
          {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
        </select>
      </div>

      {state?.error ? <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="sm:col-span-2 text-sm text-emerald-600">Salvo com sucesso.</p> : null}

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
