import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  TIPO_REGISTRO_PONTO_LABEL,
  TIPO_REGISTRO_PONTO_COLOR,
  TIPO_FOLGA_LABEL,
  STATUS_FOLGA_LABEL,
  STATUS_FOLGA_COLOR,
  STATUS_FOLHA_LABEL,
  STATUS_FOLHA_COLOR,
  formatBRL,
  formatDateOnly as formatDate,
} from "@/lib/labels";
import { atualizarStatusFolga, marcarFolhaPaga } from "@/app/actions/rh";
import { PontoForm } from "./ponto-form";
import { FolgaForm } from "./folga-form";
import { FolhaForm } from "./folha-form";

export const metadata: Metadata = {
  title: "RH do colaborador — Gestão de Obra",
};

export default async function RhColaboradorPage({
  params,
}: PageProps<"/rh/[colaboradorId]">) {
  const { colaboradorId } = await params;

  const colaborador = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
  });

  if (!colaborador) {
    notFound();
  }

  const [registrosPonto, folgas, folhas] = await Promise.all([
    prisma.registroPonto.findMany({
      where: { colaboradorId },
      orderBy: { data: "desc" },
      take: 15,
    }),
    prisma.folgaFerias.findMany({
      where: { colaboradorId },
      orderBy: { dataInicio: "desc" },
    }),
    prisma.folhaPagamento.findMany({
      where: { colaboradorId },
      orderBy: { mesReferencia: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/rh" className="text-sm text-slate-500 hover:text-slate-800">
          ← RH
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          {colaborador.nome}
        </h1>
        <p className="text-sm text-slate-500">{colaborador.funcao ?? "—"}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <p className="text-sm font-semibold text-slate-800">
          Cartão de ponto
        </p>
        <div className="mt-3">
          <PontoForm colaboradorId={colaborador.id} />
        </div>
        <div className="mt-4 flex flex-col gap-1">
          {registrosPonto.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum registro ainda.</p>
          ) : (
            registrosPonto.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border-b border-slate-100 py-1.5 text-sm last:border-0"
              >
                <span className="text-slate-700">{formatDate(r.data)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_REGISTRO_PONTO_COLOR[r.tipo]}`}
                >
                  {TIPO_REGISTRO_PONTO_LABEL[r.tipo]}
                </span>
                <span className="text-xs text-slate-500">
                  {r.horaEntrada ?? "—"} – {r.horaSaida ?? "—"}
                </span>
                <span className="flex-1 truncate pl-2 text-xs text-slate-500">
                  {r.observacao}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <p className="text-sm font-semibold text-slate-800">Férias e folgas</p>
        <div className="mt-3">
          <FolgaForm colaboradorId={colaborador.id} />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {folgas.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma solicitação ainda.</p>
          ) : (
            folgas.map((f) => (
              <div
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-1.5 text-sm last:border-0"
              >
                <span className="text-slate-700">
                  {TIPO_FOLGA_LABEL[f.tipo]}: {formatDate(f.dataInicio)} →{" "}
                  {formatDate(f.dataFim)}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_FOLGA_COLOR[f.status]}`}
                  >
                    {STATUS_FOLGA_LABEL[f.status]}
                  </span>
                  {f.status === "SOLICITADA" && (
                    <>
                      <form
                        action={atualizarStatusFolga.bind(
                          null,
                          f.id,
                          colaborador.id,
                          "APROVADA"
                        )}
                      >
                        <button
                          type="submit"
                          className="text-xs font-medium text-emerald-600 hover:underline"
                        >
                          Aprovar
                        </button>
                      </form>
                      <form
                        action={atualizarStatusFolga.bind(
                          null,
                          f.id,
                          colaborador.id,
                          "RECUSADA"
                        )}
                      >
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Recusar
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <p className="text-sm font-semibold text-slate-800">
          Folha de pagamento
        </p>
        <div className="mt-3">
          <FolhaForm colaboradorId={colaborador.id} />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {folhas.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum lançamento ainda.</p>
          ) : (
            folhas.map((f) => (
              <div
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-1.5 text-sm last:border-0"
              >
                <span className="text-slate-700">{f.mesReferencia}</span>
                <span className="text-slate-600">
                  Base {formatBRL(f.salarioBase)} − Descontos{" "}
                  {formatBRL(f.descontos)} ={" "}
                  <span className="font-medium text-slate-900">
                    {formatBRL(f.valorLiquido)}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_FOLHA_COLOR[f.status]}`}
                  >
                    {STATUS_FOLHA_LABEL[f.status]}
                  </span>
                  {f.status === "PENDENTE" && (
                    <form
                      action={marcarFolhaPaga.bind(null, f.id, colaborador.id)}
                    >
                      <button
                        type="submit"
                        className="text-xs font-medium text-emerald-600 hover:underline"
                      >
                        Marcar paga
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
