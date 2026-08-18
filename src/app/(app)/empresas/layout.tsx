import { requireModulo } from "@/lib/permissoes";

export default async function EmpresasLayout({
  children,
}: LayoutProps<"/empresas">) {
  await requireModulo("empresas");
  return <>{children}</>;
}
