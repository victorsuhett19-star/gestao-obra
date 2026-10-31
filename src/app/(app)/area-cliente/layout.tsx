import { requireModulo } from "@/lib/permissoes";

export default async function AreaClienteLayout({
  children,
}: LayoutProps<"/area-cliente">) {
  await requireModulo("areacliente");
  return <>{children}</>;
}
