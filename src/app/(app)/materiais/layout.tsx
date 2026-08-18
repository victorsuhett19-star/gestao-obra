import { requireModulo } from "@/lib/permissoes";

export default async function MateriaisLayout({
  children,
}: LayoutProps<"/materiais">) {
  await requireModulo("materiais");
  return <>{children}</>;
}
