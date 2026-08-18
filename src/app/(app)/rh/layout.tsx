import { requireModulo } from "@/lib/permissoes";

export default async function RhLayout({ children }: LayoutProps<"/rh">) {
  await requireModulo("rh");
  return <>{children}</>;
}
