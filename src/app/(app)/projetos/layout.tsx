import { requireModulo } from "@/lib/permissoes";

export default async function ProjetosLayout({
  children,
}: LayoutProps<"/projetos">) {
  await requireModulo("projetos");
  return <>{children}</>;
}
