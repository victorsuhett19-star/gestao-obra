import { requireModulo } from "@/lib/permissoes";

export default async function MarcenariaLayout({
  children,
}: LayoutProps<"/marcenaria">) {
  await requireModulo("marcenaria");
  return <>{children}</>;
}
