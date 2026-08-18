import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ItemOrcamentoForm } from "../item-form";

export const metadata: Metadata = {
  title: "Novo item de orçamento — Gestão de Obra",
};

export default async function NovoItemOrcamentoPage({
  params,
}: PageProps<"/obras/[obraId]/orcamento/novo">) {
  const { obraId } = await params;

  const etapas = await prisma.etapa.findMany({
    where: { obraId },
    select: { id: true, nome: true },
    orderBy: { ordem: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Novo item de orçamento
        </h2>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <ItemOrcamentoForm obraId={obraId} etapas={etapas} />
      </div>
    </div>
  );
}
