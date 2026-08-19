import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { buildEtapaTree, flattenTree } from "@/lib/etapa-tree";
import { BackLink } from "@/components/back-link";
import { EtapaForm } from "../etapa-form";

export const metadata: Metadata = {
  title: "Nova etapa — Gestão de Obra",
};

export default async function NovaEtapaPage({
  params,
  searchParams,
}: PageProps<"/obras/[obraId]/cronograma/novo">) {
  const { obraId } = await params;
  const sp = await searchParams;
  const paiId = typeof sp.paiId === "string" ? sp.paiId : undefined;
  const empresaAtivaId = await getEmpresaAtivaId();

  const [etapas, usuarios] = await Promise.all([
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

  const etapasParaSelecao = flattenTree(buildEtapaTree(etapas));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={`/obras/${obraId}/cronograma`} label="Cronograma" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Nova etapa</h2>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-surface p-6">
        <EtapaForm
          obraId={obraId}
          etapasParaSelecao={etapasParaSelecao}
          usuarios={usuarios}
          paiIdPadrao={paiId}
        />
      </div>
    </div>
  );
}
