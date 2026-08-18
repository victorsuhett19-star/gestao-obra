import { requireModulo } from "@/lib/permissoes";

export default async function AtendimentoLayout({
  children,
}: LayoutProps<"/atendimento">) {
  await requireModulo("atendimento");
  return <>{children}</>;
}
