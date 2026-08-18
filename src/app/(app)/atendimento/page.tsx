import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_ATENDIMENTO } from "@/lib/definitions";
import { STATUS_ATENDIMENTO_LABEL, ORIGEM_ATENDIMENTO_LABEL, formatBRL } from "@/lib/labels";
import { moverAtendimento, converterEmObra, deleteAtendimento } from "@/app/actions/atendimento";

export const metadata: Metadata = {
  title: "Atendimento — Gestão de Obra",
};

export default async function AtendimentoPage() {
  const atendimentos = await prisma.atendimento.findMany({
    include: { vendedor: { select: { nome: true } } },
    orderBy: { criadoEm: "asc" },
  });

  const colunas = STATUS_ATENDIMENTO.filter((s) => s !== "PERDIDO");
  const perdidos = atendimentos.filter((a) => a.status === "PERDIDO");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Atendimento</h1>
          <p className="text-sm text-slate-500">
            Funil de vendas — {atendimentos.length} atendimento(s), {perdidos.length} perdido(s).
          </p>
        </div>
        <Link
          href="/atendimento/novo"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo atendimento
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {colunas.map((status, colIndex) => {
          const itens = atendimentos.filter((a) => a.status === status);
          return (
            <div
              key={status}
              className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {STATUS_ATENDIMENTO_LABEL[status]}
                </p>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {itens.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {itens.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <Link
                      href={`/atendimento/${item.id}/editar`}
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {item.nomeCliente}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {ORIGEM_ATENDIMENTO_LABEL[item.origem]}
                      {item.ambienteDesejado && ` · ${item.ambienteDesejado}`}
                    </p>
                    {item.valorEstimado && (
                      <p className="mt-0.5 text-xs font-medium text-slate-700">
                        {formatBRL(item.valorEstimado)}
                      </p>
                    )}
                    {item.vendedor && (
                      <p className="mt-0.5 text-xs text-slate-500">{item.vendedor.nome}</p>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-1">
                        <form action={moverAtendimento.bind(null, item.id, "voltar")}>
                          <button
                            type="submit"
                            disabled={colIndex === 0}
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                          >
                            ←
                          </button>
                        </form>
                        {status !== "GANHO" ? (
                          <form action={moverAtendimento.bind(null, item.id, "avancar")}>
                            <button
                              type="submit"
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                            >
                              →
                            </button>
                          </form>
                        ) : (
                          !item.obraId && (
                            <form action={converterEmObra.bind(null, item.id)}>
                              <button
                                type="submit"
                                className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                              >
                                Converter em obra
                              </button>
                            </form>
                          )
                        )}
                      </div>
                      <form action={deleteAtendimento.bind(null, item.id)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Perdidos
            </p>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
              {perdidos.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {perdidos.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 opacity-70 shadow-sm">
                <p className="text-sm font-medium text-slate-900">{item.nomeCliente}</p>
                {item.motivoPerda && (
                  <p className="mt-0.5 text-xs text-slate-500">{item.motivoPerda}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
