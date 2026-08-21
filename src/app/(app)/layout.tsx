import { getColaboradorAtual, ehAdmin } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { AppNav } from "@/components/app-nav";
import { Toaster } from "sonner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const colaborador = await getColaboradorAtual();
  const admin = ehAdmin(colaborador);

  if (!colaborador) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
        <p className="max-w-sm text-slate-600">
          Seu usuário está autenticado, mas ainda não foi vinculado a um cadastro de
          colaborador. Contate o RH/administração.
        </p>
        <form action={signOut}>
          <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">
            Sair
          </button>
        </form>
      </div>
    );
  }

  const links = [
    { href: "/", label: "Início" },
    { href: "/clientes", label: "Clientes" },
    { href: "/pipeline", label: "Pipeline" },
    { href: "/visitas", label: "Visitas" },
    ...(admin ? [{ href: "/colaboradores", label: "Colaboradores" }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors closeButton />
      <AppNav links={links} nome={colaborador.nome} cargo={colaborador.cargo} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
