import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { LancamentoForm } from "../lancamento-form";

export const metadata: Metadata = {
  title: "Novo lançamento — Gestão de Obra",
};

export default async function NovoLancamentoPage({
  params,
}: PageProps<"/obras/[obraId]/financeiro/novo">) {
  const { obraId } = await params;

  const itensOrcamento = await prisma.itemOrcamento.findMany({
    where: { obraId },
    select: { id: true, descricao: true },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={`/obras/${obraId}/financeiro`} label="Financeiro" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Novo lançamento financeiro
        </h2>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <LancamentoForm obraId={obraId} itensOrcamento={itensOrcamento} />
      </div>
    </div>
  );
}
