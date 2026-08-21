"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

type NavLink = { href: string; label: string };

export function AppNav({
  links,
  nome,
  cargo,
}: {
  links: NavLink[];
  nome: string;
  cargo: string;
}) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-slate-900">RH + CRM</span>
          <nav className="hidden gap-4 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm hover:text-emerald-700 ${
                  pathname === l.href ? "font-medium text-emerald-700" : "text-slate-600"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/conta/senha" className="text-sm text-slate-500 hover:text-emerald-700">
            {nome} · <span className="capitalize">{cargo}</span>
          </Link>
          <form action={signOut}>
            <button className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100">
              Sair
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-label="Abrir menu"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 sm:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-700">
            {aberto ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {aberto && (
        <div className="border-t border-slate-200 sm:hidden">
          <nav className="flex flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAberto(false)}
                className={`rounded-md px-2 py-2 text-sm ${
                  pathname === l.href ? "font-medium text-emerald-700" : "text-slate-600"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/conta/senha"
              onClick={() => setAberto(false)}
              className="rounded-md px-2 py-2 text-sm text-slate-600"
            >
              {nome} · <span className="capitalize">{cargo}</span>
            </Link>
            <form action={signOut} className="px-2 py-2">
              <button className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
                Sair
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  );
}
