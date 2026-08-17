import Link from "next/link";
import { verifySession, getUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { navItems } from "./nav-items";
import { PAPEL_LABEL } from "@/lib/labels";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await verifySession();
  const user = await getUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-sm font-semibold text-slate-900">Gestão de Obra</p>
          <p className="text-xs text-slate-500">Turn-key</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {user?.nome ?? "Usuário"}
            </p>
            <p className="text-xs text-slate-500">
              {user ? PAPEL_LABEL[user.papel] ?? user.papel : ""}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
