import { requireModulo } from "@/lib/permissoes";

export default async function MarmorariaLayout({
  children,
}: LayoutProps<"/marmoraria">) {
  await requireModulo("projetos");
  return <>{children}</>;
}
