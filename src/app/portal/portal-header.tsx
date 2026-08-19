import { logoutCliente } from "@/app/actions/cliente";
import { ThemeToggle } from "@/components/theme-toggle";

export function PortalHeader({ nome }: { nome: string }) {
  return (
    <div className="border-b border-slate-200 bg-surface px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-empresa.png" alt="" className="h-7 w-auto" />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Portal do cliente
            </p>
            <p className="text-xs text-slate-500">Olá, {nome}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logoutCliente}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
