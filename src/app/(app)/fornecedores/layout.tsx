import { requireModulo } from "@/lib/permissoes";

export default async function FornecedoresLayout({
  children,
}: LayoutProps<"/fornecedores">) {
  await requireModulo("fornecedores");
  return <>{children}</>;
}
