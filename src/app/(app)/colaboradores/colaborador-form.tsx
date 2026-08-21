"use client";

import { useActionState } from "react";
import type { Tables } from "@/lib/supabase/types";
import { ActionToast } from "@/components/action-toast";

const CARGOS = ["vendedor", "supervisor", "gerente", "terceiro", "motorista", "administrativo"];
const VINCULOS = ["CLT", "PJ", "terceirizado", "comissionado"];
const STATUSES = ["ativo", "inativo", "afastado"];

type Action = (prevState: unknown, formData: FormData) => Promise<{ error?: string; success?: boolean }>;

export function ColaboradorForm({
  action,
  colaborador,
  supervisores,
  submitLabel,
}: {
  action: Action;
  colaborador?: Tables<"colaboradores">;
  supervisores: { id: string; nome: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <ActionToast error={state.error} success={state.success} successMessage="Colaborador salvo." />
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Nome</label>
        <input name="nome" required defaultValue={colaborador?.nome} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">CPF</label>
        <input name="cpf" required defaultValue={colaborador?.cpf} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Cargo</label>
        <select name="cargo" required defaultValue={colaborador?.cargo ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="" disabled>Selecione</option>
          {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Tipo de vínculo</label>
        <select name="tipo_vinculo" required defaultValue={colaborador?.tipo_vinculo ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="" disabled>Selecione</option>
          {VINCULOS.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Status</label>
        <select name="status" defaultValue={colaborador?.status ?? "ativo"} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Supervisor</label>
        <select name="supervisor_id" defaultValue={colaborador?.supervisor_id ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Nenhum</option>
          {supervisores.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Data de admissão</label>
        <input type="date" name="data_admissao" defaultValue={colaborador?.data_admissao ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">E-mail</label>
        <input type="email" name="email" defaultValue={colaborador?.email ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Telefone</label>
        <input name="telefone" defaultValue={colaborador?.telefone ?? ""} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
