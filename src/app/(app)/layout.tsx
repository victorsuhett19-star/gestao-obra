import { verifySession, getUser } from "@/lib/dal";
import { getEmpresaAtivaId, getEmpresasDoUsuario } from "@/lib/empresa";
import { podeVerModulo } from "@/lib/permissoes";
import { logout } from "@/app/actions/auth";
import { navItems } from "./nav-items";
import { PAPEL_LABEL } from "@/lib/labels";
import { Sidebar } from "./mobile-nav";
import { EmpresaSwitcher } from "./empresa-switcher";
import { TopBar } from "./top-bar";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await verifySession();
  const user = await getUser();
  const [empresaAtivaId, empresas] = await Promise.all([
    getEmpresaAtivaId(),
    getEmpresasDoUsuario(),
  ]);

  const itensVisiveis = navItems.filter(
    (item) => !item.modulo || podeVerModulo(user, item.modulo)
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 sm:flex-row">
      <Sidebar
        navItems={itensVisiveis}
        userNome={user?.nome ?? "Usuário"}
        userPapel={user ? (PAPEL_LABEL[user.papel] ?? user.papel) : ""}
        logoutAction={logout}
        empresaSwitcher={
          empresas.length > 1 ? (
            <EmpresaSwitcher
              empresas={empresas}
              empresaAtivaId={empresaAtivaId ?? ""}
            />
          ) : undefined
        }
      />

      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar
          nome={user?.nome ?? "Usuário"}
          papel={user ? (PAPEL_LABEL[user.papel] ?? user.papel) : ""}
        />
        <div className="flex-1 p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
