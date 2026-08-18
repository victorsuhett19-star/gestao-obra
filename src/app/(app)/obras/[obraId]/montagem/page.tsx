import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  STATUS_MONTAGEM_LABEL,
  STATUS_MONTAGEM_COLOR,
  formatBRL,
  formatDateOnly,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Montagem — Gestão de Obra",
};

function formatDate(date: Date | null) {
  if (!date) return "—";
  return formatDateOnly(date);
}

export default async function MontagemPage({
  params,
}: PageProps<"/obras/[obraId]/montagem">) {
  const { obraId } = await params;

  const registros = await prisma.registroMontagem.findMany({
    where: { obraId },
    include: {
      montador: { select: { nome: true } },
      ambientes: true,
      itensExtras: true,
      faltasFabrica: true,
    },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Montagem</h2>
          <p className="text-sm text-slate-500">
            {registros.length} registro(s) de montagem.
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/montagem/novo`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Nova montagem
        </Link>
      </div>

      {registros.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum registro de montagem ainda.
          </p>
          <Link
            href={`/obras/${obraId}/montagem/novo`}
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Nova montagem
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {registros.map((r) => {
            const pendencias =
              r.itensExtras.filter((i) => !i.recebido).length +
              r.faltasFabrica.filter((f) => !f.recebido).length;
            return (
              <Link
                key={r.id}
                href={`/obras/${obraId}/montagem/${r.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {r.ambientes.map((a) => a.nome).join(", ") || "Sem ambientes"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.montador?.nome ?? "Sem montador definido"} · Chegada{" "}
                    {formatDate(r.dataChegada)}
                    {pendencias > 0 && ` · ${pendencias} pendência(s)`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-900">
                    {formatBRL(r.valorTotal)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_MONTAGEM_COLOR[r.status]}`}
                  >
                    {STATUS_MONTAGEM_LABEL[r.status]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
