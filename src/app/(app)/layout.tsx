import { getColaboradorAtual, ehAdmin } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import Link from "next/link";

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
    { href: "/colaboradores", label: "Colaboradores", adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-900">RH + CRM</span>
            <nav className="flex gap-4">
              {links
                .filter((l) => !l.adminOnly || admin)
                .map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm text-slate-600 hover:text-emerald-700"
                  >
                    {l.label}
                  </Link>
                ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {colaborador.nome} · <span className="capitalize">{colaborador.cargo}</span>
            </span>
            <form action={signOut}>
              <button className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
