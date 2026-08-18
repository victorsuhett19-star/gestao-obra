import { requireModulo } from "@/lib/permissoes";

export default async function UsuariosLayout({
  children,
}: LayoutProps<"/usuarios">) {
  await requireModulo("usuarios");
  return <>{children}</>;
}
