import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Vistoria final — Gestão de Obra",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default async function VistoriaPage({
  params,
}: PageProps<"/obras/[obraId]/vistoria">) {
  const { obraId } = await params;

  const vistorias = await prisma.vistoriaFinal.findMany({
    where: { obraId },
    include: { responsavel: { select: { nome: true } }, itens: true },
    orderBy: { dataVistoria: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Vistoria final
          </h2>
          <p className="text-sm text-slate-500">
            {vistorias.length} relatório(s) de vistoria.
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/vistoria/novo`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo relatório
        </Link>
      </div>

      {vistorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum relatório de vistoria ainda.
          </p>
          <Link
            href={`/obras/${obraId}/vistoria/novo`}
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo relatório
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vistorias.map((v) => (
            <Link
              key={v.id}
              href={`/obras/${obraId}/vistoria/${v.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Vistoria de {formatDate(v.dataVistoria)}
                </p>
                <p className="text-xs text-slate-500">
                  {v.itens.length} ambiente(s) · {v.responsavel?.nome ?? "—"}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${v.assinadoResponsavelEm ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {v.assinadoResponsavelEm ? "Responsável assinou" : "Aguarda responsável"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${v.assinadoClienteEm ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {v.assinadoClienteEm ? "Cliente assinou" : "Aguarda cliente"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
