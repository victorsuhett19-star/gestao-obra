import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ItemOrcamentoForm } from "../../item-form";

export const metadata: Metadata = {
  title: "Editar item de orçamento — Gestão de Obra",
};

export default async function EditarItemOrcamentoPage({
  params,
  searchParams,
}: PageProps<"/obras/[obraId]/orcamento/[itemId]/editar">) {
  const { obraId, itemId } = await params;
  const sp = await searchParams;
  const voltarPara = typeof sp.voltarPara === "string" ? sp.voltarPara : undefined;

  const [item, etapas] = await Promise.all([
    prisma.itemOrcamento.findUnique({ where: { id: itemId } }),
    prisma.etapa.findMany({
      where: { obraId },
      select: { id: true, nome: true },
      orderBy: { ordem: "asc" },
    }),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={voltarPara ?? `/obras/${obraId}/orcamento`} label="Orçamento" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Editar item de orçamento
        </h2>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-surface p-6">
        <ItemOrcamentoForm obraId={obraId} etapas={etapas} item={item} voltarPara={voltarPara} />
      </div>
    </div>
  );
}
