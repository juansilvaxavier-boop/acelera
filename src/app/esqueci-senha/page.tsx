"use client";

import { useActionState } from "react";
import Link from "next/link";
import { solicitarRedefinicaoSenha } from "@/app/login/actions";

export default function EsqueciSenhaPage() {
  const [state, formAction, pending] = useActionState(solicitarRedefinicaoSenha, {
    error: "",
    success: false,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Esqueci minha senha</h1>
        <p className="mt-1 text-sm text-slate-500">
          Informe seu e-mail — se houver uma conta, enviaremos um link para redefinir a senha.
        </p>

        {state?.success ? (
          <p className="mt-6 text-sm text-emerald-700">
            Se o e-mail informado tiver uma conta, um link de redefinição foi enviado. Confira sua
            caixa de entrada.
          </p>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {pending ? "Enviando..." : "Enviar link de redefinição"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-emerald-700 hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
