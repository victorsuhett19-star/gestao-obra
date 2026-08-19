import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildEtapaTree } from "@/lib/etapa-tree";
import { EtapaRow } from "./etapa-row";

export const metadata: Metadata = {
  title: "Cronograma — Gestão de Obra",
};

export default async function CronogramaPage({
  params,
}: PageProps<"/obras/[obraId]/cronograma">) {
  const { obraId } = await params;

  const etapas = await prisma.etapa.findMany({
    where: { obraId },
    include: { responsavel: { select: { id: true, nome: true } } },
    orderBy: { ordem: "asc" },
  });

  const arvore = buildEtapaTree(etapas);

  const mediaConcluido =
    etapas.length === 0
      ? 0
      : Math.round(
          etapas.reduce((acc, e) => acc + e.percentualConcluido, 0) /
            etapas.length
        );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Cronograma</h2>
          <p className="text-sm text-slate-500">
            {etapas.length === 0
              ? "Nenhuma etapa cadastrada ainda."
              : `${etapas.length} etapa(s) · ${mediaConcluido}% concluído em média`}
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/cronograma/novo`}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Nova etapa
        </Link>
      </div>

      {arvore.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">
            Monte a EAP/cronograma desta obra cadastrando as etapas principais
            e, se precisar, subetapas dentro delas.
          </p>
          <Link
            href={`/obras/${obraId}/cronograma/novo`}
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Nova etapa
          </Link>
        </div>
      ) : (
        <div className="card px-4">
          {arvore.map((node) => (
            <EtapaRow key={node.id} node={node} obraId={obraId} />
          ))}
        </div>
      )}
    </div>
  );
}
