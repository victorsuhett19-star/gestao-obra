"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function Sidebar({
  navItems,
  userNome,
  userPapel,
  logoutAction,
  empresaSwitcher,
}: {
  navItems: NavItem[];
  userNome: string;
  userPapel: string;
  logoutAction: () => void;
  empresaSwitcher?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Topo mobile, só aparece em telas pequenas */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-empresa.png" alt="" className="h-7 w-auto" />
          <p className="text-sm font-semibold text-slate-900">Gestão de Obra</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-lg border border-slate-300 p-1.5 text-slate-700"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Fundo escuro atrás do menu aberto no mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 sm:static sm:z-auto sm:w-60 ${
          open ? "" : "max-sm:-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-empresa.png" alt="" className="h-9 w-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Gestão de Obra</p>
              <p className="text-xs text-slate-500">Turn-key</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="rounded-lg p-1 text-slate-500 sm:hidden"
          >
            ✕
          </button>
        </div>

        {empresaSwitcher && <div className="py-3">{empresaSwitcher}</div>}

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {userNome}
            </p>
            <p className="text-xs text-slate-500">{userPapel}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
