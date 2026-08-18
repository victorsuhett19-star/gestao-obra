import { requireModulo } from "@/lib/permissoes";

export default async function AgendaLayout({ children }: LayoutProps<"/agenda">) {
  await requireModulo("agenda");
  return <>{children}</>;
}
