import { requireModulo } from "@/lib/permissoes";

export default async function FinanceiroLayout({
  children,
}: LayoutProps<"/financeiro">) {
  await requireModulo("financeiro");
  return <>{children}</>;
}
