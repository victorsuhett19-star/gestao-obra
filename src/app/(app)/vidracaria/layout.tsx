import { requireModulo } from "@/lib/permissoes";

export default async function VidracariaLayout({
  children,
}: LayoutProps<"/vidracaria">) {
  await requireModulo("vidracaria");
  return <>{children}</>;
}
