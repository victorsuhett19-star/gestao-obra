import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { LancamentoForm } from "../../lancamento-form";

export const metadata: Metadata = {
  title: "Editar lançamento — Gestão de Obra",
};

export default async function EditarLancamentoPage({
  params,
  searchParams,
}: PageProps<"/obras/[obraId]/financeiro/[lancamentoId]/editar">) {
  const { obraId, lancamentoId } = await params;
  const sp = await searchParams;
  const voltarPara = typeof sp.voltarPara === "string" ? sp.voltarPara : undefined;

  const [lancamento, itensOrcamento] = await Promise.all([
    prisma.lancamentoFinanceiro.findUnique({ where: { id: lancamentoId } }),
    prisma.itemOrcamento.findMany({
      where: { obraId },
      select: { id: true, descricao: true },
      orderBy: { criadoEm: "asc" },
    }),
  ]);

  if (!lancamento) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={voltarPara ?? `/obras/${obraId}/financeiro`} label="Financeiro" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Editar lançamento financeiro
        </h2>
      </div>
      <div className="max-w-2xl card p-6">
        <LancamentoForm
          obraId={obraId}
          itensOrcamento={itensOrcamento}
          lancamento={lancamento}
          voltarPara={voltarPara}
        />
      </div>
    </div>
  );
}
