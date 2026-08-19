import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RelatorioTab } from "@/components/relatorio-tab";

export default async function ProjetoRelatorioPage({
  params,
}: PageProps<"/projetos/[obraId]/relatorio">) {
  const { obraId } = await params;

  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra) notFound();

  const [templates, relatorios] = await Promise.all([
    prisma.relatorioTemplate.findMany({
      where: { empresaId: obra.empresaId },
      orderBy: { nome: "asc" },
    }),
    prisma.relatorioObra.findMany({
      where: { obraId },
      orderBy: { criadoEm: "desc" },
      include: { criadoPor: true },
    }),
  ]);

  return <RelatorioTab obraId={obraId} templates={templates} relatorios={relatorios} />;
}
