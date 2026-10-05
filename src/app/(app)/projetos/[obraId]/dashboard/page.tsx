import { redirect } from "next/navigation";

// O dashboard financeiro do projeto foi incorporado na aba Financeiro —
// mantém esse endereço funcionando (ex: links antigos salvos) redirecionando
// pra lá em vez de simplesmente remover a página.
export default async function DashboardProjetoPage({
  params,
}: PageProps<"/projetos/[obraId]/dashboard">) {
  const { obraId } = await params;
  redirect(`/projetos/${obraId}/financeiro`);
}
