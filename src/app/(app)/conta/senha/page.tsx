"use client";

import { useActionState } from "react";
import { alterarSenha } from "./actions";
import { ActionToast } from "@/components/action-toast";

export default function TrocarSenhaPage() {
  const [state, formAction, pending] = useActionState(alterarSenha, { error: "" });

  return (
    <div className="max-w-sm">
      <h1 className="text-lg font-semibold text-slate-900">Trocar senha</h1>
      <form action={formAction} className="mt-4 space-y-4">
        <ActionToast error={state.error} success={state.success} successMessage="Senha alterada com sucesso." />
        <div>
          <label className="block text-sm font-medium text-slate-700">Nova senha</label>
          <input
            type="password"
            name="senha"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Confirmar nova senha</label>
          <input
            type="password"
            name="confirmacao"
            required
            minLength={6}
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
