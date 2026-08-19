import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { LancamentoForm } from "../lancamento-form";

export const metadata: Metadata = {
  title: "Novo lançamento — Gestão de Obra",
};

export default async function NovoLancamentoPage({
  params,
  searchParams,
}: PageProps<"/obras/[obraId]/financeiro/novo">) {
  const { obraId } = await params;
  const sp = await searchParams;
  const voltarPara = typeof sp.voltarPara === "string" ? sp.voltarPara : undefined;

  const itensOrcamento = await prisma.itemOrcamento.findMany({
    where: { obraId },
    select: { id: true, descricao: true },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={voltarPara ?? `/obras/${obraId}/financeiro`} label="Financeiro" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Novo lançamento financeiro
        </h2>
      </div>
      <div className="max-w-2xl card p-6">
        <LancamentoForm obraId={obraId} itensOrcamento={itensOrcamento} voltarPara={voltarPara} />
      </div>
    </div>
  );
}
