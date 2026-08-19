import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { formatBRL, formatDateOnly } from "@/lib/labels";
import { marcarContaPaga, deleteContaFinanceira } from "@/app/actions/financeiro-empresa";

export const metadata: Metadata = {
  title: "Financeiro — Gestão de Obra",
};

function inicioFimMes(mes: string) {
  // mes no formato "AAAA-MM"
  const [ano, m] = mes.split("-").map(Number);
  const inicio = new Date(Date.UTC(ano, m - 1, 1));
  const fim = new Date(Date.UTC(ano, m, 0, 23, 59, 59));
  return { inicio, fim };
}

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

export default async function FinanceiroEmpresaPage({
  searchParams,
}: PageProps<"/financeiro">) {
  const sp = await searchParams;
  const mes = typeof sp.mes === "string" && sp.mes ? sp.mes : mesAtual();
  const { inicio, fim } = inicioFimMes(mes);
  const empresaAtivaId = await getEmpresaAtivaId();

  const [contasPagarPendentes, contasReceberPendentes, contasDoMes, lancamentosObras] =
    await Promise.all([
      prisma.contaFinanceira.findMany({
        where: { empresaId: empresaAtivaId ?? undefined, tipo: "PAGAR", status: "PENDENTE" },
        orderBy: { dataVencimento: "asc" },
      }),
      prisma.contaFinanceira.findMany({
        where: { empresaId: empresaAtivaId ?? undefined, tipo: "RECEBER", status: "PENDENTE" },
        orderBy: { dataVencimento: "asc" },
      }),
      prisma.contaFinanceira.findMany({
        where: {
          empresaId: empresaAtivaId ?? undefined,
          status: "PAGO",
          dataPagamento: { gte: inicio, lte: fim },
        },
      }),
      prisma.lancamentoFinanceiro.findMany({
        where: {
          obra: { empresaId: empresaAtivaId ?? undefined },
          data: { gte: inicio, lte: fim },
        },
      }),
    ]);

  const receitaContas = contasDoMes
    .filter((c) => c.tipo === "RECEBER")
    .reduce((acc, c) => acc + c.valor, 0);
  const custoContas = contasDoMes
    .filter((c) => c.tipo === "PAGAR")
    .reduce((acc, c) => acc + c.valor, 0);
  const receitaObras = lancamentosObras
    .filter((l) => l.tipo === "RECEITA")
    .reduce((acc, l) => acc + l.valor, 0);
  const custoObras = lancamentosObras
    .filter((l) => l.tipo === "CUSTO")
    .reduce((acc, l) => acc + l.valor, 0);

  const receitaTotal = receitaContas + receitaObras;
  const custoTotal = custoContas + custoObras;
  const resultado = receitaTotal - custoTotal;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500">
            DRE simplificado, contas a pagar e a receber.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form method="get" className="flex items-center gap-2">
            <input
              name="mes"
              type="month"
              defaultValue={mes}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Ver mês
            </button>
          </form>
          <Link
            href="/financeiro/dashboard"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/financeiro/novo"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
          >
            + Nova conta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Receitas do mês
          </p>
          <p className="mt-1 text-xl font-semibold text-emerald-600">
            {formatBRL(receitaTotal)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Contas: {formatBRL(receitaContas)} · Obras: {formatBRL(receitaObras)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Custos do mês
          </p>
          <p className="mt-1 text-xl font-semibold text-red-600">
            {formatBRL(custoTotal)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Contas: {formatBRL(custoContas)} · Obras: {formatBRL(custoObras)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Resultado (DRE)
          </p>
          <p
            className={`mt-1 text-xl font-semibold ${resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {formatBRL(resultado)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {resultado >= 0
              ? "Acima do ponto de equilíbrio"
              : "Abaixo do ponto de equilíbrio"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">
            Contas a pagar pendentes
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {contasPagarPendentes.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma conta pendente.</p>
            ) : (
              contasPagarPendentes.map((c) => {
                const atrasada = c.dataVencimento < hoje;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0"
                  >
                    <div>
                      <p className="text-slate-800">{c.descricao}</p>
                      <p
                        className={`text-xs ${atrasada ? "font-medium text-red-600" : "text-slate-500"}`}
                      >
                        Vence {formatDateOnly(c.dataVencimento)}
                        {atrasada && " · atrasada"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {formatBRL(c.valor)}
                      </span>
                      <form action={marcarContaPaga.bind(null, c.id)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-emerald-600 hover:underline"
                        >
                          Pagar
                        </button>
                      </form>
                      <form action={deleteContaFinanceira.bind(null, c.id)}>
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
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">
            Contas a receber pendentes
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {contasReceberPendentes.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma conta pendente.</p>
            ) : (
              contasReceberPendentes.map((c) => {
                const atrasada = c.dataVencimento < hoje;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0"
                  >
                    <div>
                      <p className="text-slate-800">{c.descricao}</p>
                      <p
                        className={`text-xs ${atrasada ? "font-medium text-red-600" : "text-slate-500"}`}
                      >
                        Vence {formatDateOnly(c.dataVencimento)}
                        {atrasada && " · atrasada"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {formatBRL(c.valor)}
                      </span>
                      <form action={marcarContaPaga.bind(null, c.id)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-emerald-600 hover:underline"
                        >
                          Receber
                        </button>
                      </form>
                      <form action={deleteContaFinanceira.bind(null, c.id)}>
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
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
