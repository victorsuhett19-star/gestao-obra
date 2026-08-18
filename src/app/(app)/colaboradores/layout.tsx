import { requireModulo } from "@/lib/permissoes";

export default async function ColaboradoresLayout({
  children,
}: LayoutProps<"/colaboradores">) {
  await requireModulo("colaboradores");
  return <>{children}</>;
}
