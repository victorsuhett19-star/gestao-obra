import { requireModulo } from "@/lib/permissoes";

export default async function ObrasLayout({ children }: LayoutProps<"/obras">) {
  await requireModulo("obras");
  return <>{children}</>;
}
