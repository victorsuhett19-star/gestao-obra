import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_CONFERENCIA } from "@/lib/definitions";
import { STATUS_CONFERENCIA_LABEL, formatDateOnly } from "@/lib/labels";
import { moverItemConferencia, deleteItemConferencia } from "@/app/actions/conferencia";

export const metadata: Metadata = {
  title: "Conferência — Gestão de Obra",
};

function formatDate(date: Date | null) {
  if (!date) return null;
  return formatDateOnly(date);
}

export default async function ConferenciaPage({
  params,
}: PageProps<"/obras/[obraId]/conferencia">) {
  const { obraId } = await params;

  const itens = await prisma.itemConferencia.findMany({
    where: { obraId },
    include: { responsavel: { select: { nome: true } } },
    orderBy: { criadoEm: "asc" },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Conferência</h2>
          <p className="text-sm text-slate-500">
            Funil de conferência de medidas e projeto por ambiente/item.
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/conferencia/novo`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo item
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {STATUS_CONFERENCIA.map((status, colIndex) => {
          const itensDaColuna = itens.filter((i) => i.status === status);
          return (
            <div
              key={status}
              className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {STATUS_CONFERENCIA_LABEL[status]}
                </p>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {itensDaColuna.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {itensDaColuna.map((item) => {
                  const prazoAtrasado =
                    item.prazo && item.prazo < hoje && status !== "CONCLUIDO";
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <p className="text-sm font-medium text-slate-900">
                        {item.titulo}
                      </p>
                      {item.responsavel && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.responsavel.nome}
                        </p>
                      )}
                      {item.prazo && (
                        <p
                          className={`mt-0.5 text-xs ${prazoAtrasado ? "font-medium text-red-600" : "text-slate-500"}`}
                        >
                          Prazo: {formatDate(item.prazo)}
                          {prazoAtrasado && " · atrasado"}
                        </p>
                      )}
                      {item.observacoes && (
                        <p className="mt-1 text-xs text-slate-600">
                          {item.observacoes}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-1">
                          <form
                            action={moverItemConferencia.bind(
                              null,
                              item.id,
                              obraId,
                              "voltar"
                            )}
                          >
                            <button
                              type="submit"
                              disabled={colIndex === 0}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                            >
                              ← Voltar
                            </button>
                          </form>
                          <form
                            action={moverItemConferencia.bind(
                              null,
                              item.id,
                              obraId,
                              "avancar"
                            )}
                          >
                            <button
                              type="submit"
                              disabled={colIndex === STATUS_CONFERENCIA.length - 1}
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                            >
                              Avançar →
                            </button>
                          </form>
                        </div>
                        <form
                          action={deleteItemConferencia.bind(null, item.id, obraId)}
                        >
                          <button
                            type="submit"
                            className="text-xs font-medium text-red-500 hover:underline"
                          >
                            Excluir
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
