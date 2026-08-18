import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { buildEtapaTree, flattenTree } from "@/lib/etapa-tree";
import { BackLink } from "@/components/back-link";
import { EtapaForm } from "../../etapa-form";

export const metadata: Metadata = {
  title: "Editar etapa — Gestão de Obra",
};

export default async function EditarEtapaPage({
  params,
}: PageProps<"/obras/[obraId]/cronograma/[etapaId]/editar">) {
  const { obraId, etapaId } = await params;
  const empresaAtivaId = await getEmpresaAtivaId();

  const [etapa, etapas, usuarios] = await Promise.all([
    prisma.etapa.findUnique({ where: { id: etapaId } }),
    prisma.etapa.findMany({
      where: { obraId },
      include: { responsavel: { select: { id: true, nome: true } } },
      orderBy: { ordem: "asc" },
    }),
    prisma.usuario.findMany({
      where: { empresaId: empresaAtivaId ?? undefined, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!etapa) {
    notFound();
  }

  const etapasParaSelecao = flattenTree(buildEtapaTree(etapas));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={`/obras/${obraId}/cronograma`} label="Cronograma" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Editar etapa</h2>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <EtapaForm
          obraId={obraId}
          etapasParaSelecao={etapasParaSelecao}
          usuarios={usuarios}
          etapa={{
            id: etapa.id,
            paiId: etapa.paiId,
            nome: etapa.nome,
            status: etapa.status,
            percentualConcluido: etapa.percentualConcluido,
            dataInicioPrevista: etapa.dataInicioPrevista,
            dataFimPrevista: etapa.dataFimPrevista,
            dataInicioReal: etapa.dataInicioReal,
            dataFimReal: etapa.dataFimReal,
            responsavelId: etapa.responsavelId,
          }}
        />
      </div>
    </div>
  );
}
