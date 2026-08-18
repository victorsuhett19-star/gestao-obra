import { verifySession, getUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { navItems } from "./nav-items";
import { PAPEL_LABEL } from "@/lib/labels";
import { Sidebar } from "./mobile-nav";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await verifySession();
  const user = await getUser();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 sm:flex-row">
      <Sidebar
        navItems={navItems}
        userNome={user?.nome ?? "Usuário"}
        userPapel={user ? (PAPEL_LABEL[user.papel] ?? user.papel) : ""}
        logoutAction={logout}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
    </div>
  );
}
