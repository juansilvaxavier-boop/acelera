"use client";

import { useActionState } from "react";
import { convidarUsuario } from "./convite-actions";
import { ActionToast } from "@/components/action-toast";

export function ConviteUsuario({
  colaboradorId,
  emailAtual,
  jaVinculado,
}: {
  colaboradorId: string;
  emailAtual: string | null;
  jaVinculado: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    convidarUsuario.bind(null, colaboradorId),
    { error: "" }
  );

  if (jaVinculado) {
    return (
      <p className="text-sm text-emerald-700">
        Este colaborador já tem acesso ao sistema.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <ActionToast error={state.error} success={state.success} successMessage="Convite enviado." />
      <div>
        <label className="block text-xs font-medium text-slate-600">E-mail para convite</label>
        <input
          type="email"
          name="email"
          required
          defaultValue={emailAtual ?? ""}
          className="mt-1 w-64 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Enviando..." : "Convidar para acessar o sistema"}
      </button>
      {state.success ? (
        <p className="w-full text-sm text-emerald-700">
          Convite enviado — a pessoa vai receber um e-mail para definir a senha.
        </p>
      ) : null}
    </form>
  );
}
