import { requireModulo } from "@/lib/permissoes";

export default async function MarcenariaLayout({
  children,
}: LayoutProps<"/marcenaria">) {
  await requireModulo("projetos");
  return <>{children}</>;
}
