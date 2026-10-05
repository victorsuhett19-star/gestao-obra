import { requireModulo } from "@/lib/permissoes";

// Obras, Marcenaria, Marmoraria, Vidraçaria e Serralheria foram unificadas
// numa aba só ("Projetos") — a permissão de acesso segue a mesma.
export default async function ObrasLayout({ children }: LayoutProps<"/obras">) {
  await requireModulo("projetos");
  return <>{children}</>;
}
