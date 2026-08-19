import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import {
  formatBRL,
  TRADE_CHART_COLOR,
  TRADE_CHART_LABEL,
} from "@/lib/labels";
import { DonutChart, type DonutSegment } from "../donut-chart";

export const metadata: Metadata = {
  title: "Dashboard financeiro — Gestão de Obra",
};

// Ordem fixa das especialidades + os dois "baldes" extras (obras turn-key
// com mais de uma especialidade marcada, e despesas gerais da empresa sem
// obra vinculada — ex: aluguel do escritório, contas administrativas).
const ORDEM_BUCKETS = [
  "OBRA",
  "PROJETO",
  "MARCENARIA",
  "MARMORARIA",
  "VIDRACARIA",
  "MULTIPLAS",
  "GERAL",
];

function inicioFimMes(mes: string) {
  const [ano, m] = mes.split("-").map(Number);
  const inicio = new Date(Date.UTC(ano, m - 1, 1));
  const fim = new Date(Date.UTC(ano, m, 0, 23, 59, 59));
  return { inicio, fim };
}

export default async function DashboardFinanceiroPage({
  searchParams,
}: PageProps<"/financeiro/dashboard">) {
  const sp = await searchParams;
  const mes = typeof sp.mes === "string" && sp.mes ? sp.mes : "";
  const periodo = mes ? inicioFimMes(mes) : null;
  const empresaAtivaId = await getEmpresaAtivaId();

  const [obras, lancamentos, contas] = await Promise.all([
    prisma.obra.findMany({
      where: { empresaId: empresaAtivaId ?? undefined },
      select: { id: true, trades: { select: { trade: true } } },
    }),
    prisma.lancamentoFinanceiro.findMany({
      where: {
        obra: { empresaId: empresaAtivaId ?? undefined },
        ...(periodo ? { data: { gte: periodo.inicio, lte: periodo.fim } } : {}),
      },
      select: { obraId: true, tipo: true, valor: true, categoria: true },
    }),
    prisma.contaFinanceira.findMany({
      where: {
        empresaId: empresaAtivaId ?? undefined,
        ...(periodo
          ? { dataVencimento: { gte: periodo.inicio, lte: periodo.fim } }
          : {}),
      },
      select: { obraId: true, tipo: true, valor: true, categoria: true },
    }),
  ]);

  // Mapa obraId -> "balde" de especialidade. Obra com 1 trade só = a
  // especialidade dela; com mais de uma = turn-key (não dá pra separar sem
  // o lançamento indicar a etapa/trade específica).
  const bucketPorObra = new Map<string, string>();
  for (const o of obras) {
    if (o.trades.length === 1) {
      bucketPorObra.set(o.id, o.trades[0].trade);
    } else if (o.trades.length > 1) {
      bucketPorObra.set(o.id, "MULTIPLAS");
    }
  }

  const receitaPorBucket = new Map<string, number>();
  const despesaPorBucket = new Map<string, number>();
  const despesaPorCategoria = new Map<string, number>();

  function addReceita(bucket: string, valor: number) {
    receitaPorBucket.set(bucket, (receitaPorBucket.get(bucket) ?? 0) + valor);
  }
  function addDespesa(bucket: string, valor: number) {
    despesaPorBucket.set(bucket, (despesaPorBucket.get(bucket) ?? 0) + valor);
  }
  function addCategoria(categoria: string | null, valor: number) {
    const chave = categoria?.trim() || "Sem categoria";
    despesaPorCategoria.set(chave, (despesaPorCategoria.get(chave) ?? 0) + valor);
  }

  for (const l of lancamentos) {
    const bucket = bucketPorObra.get(l.obraId) ?? "MULTIPLAS";
    if (l.tipo === "RECEITA") {
      addReceita(bucket, l.valor);
    } else if (l.tipo === "CUSTO") {
      addDespesa(bucket, l.valor);
      addCategoria(l.categoria, l.valor);
    }
  }

  for (const c of contas) {
    const bucket = c.obraId ? (bucketPorObra.get(c.obraId) ?? "MULTIPLAS") : "GERAL";
    if (c.tipo === "RECEBER") {
      addReceita(bucket, c.valor);
    } else if (c.tipo === "PAGAR") {
      addDespesa(bucket, c.valor);
      addCategoria(c.categoria, c.valor);
    }
  }

  const receitaSegments: DonutSegment[] = ORDEM_BUCKETS.map((key) => ({
    key,
    label: TRADE_CHART_LABEL[key],
    valor: receitaPorBucket.get(key) ?? 0,
    cor: TRADE_CHART_COLOR[key],
  }));
  const despesaSegments: DonutSegment[] = ORDEM_BUCKETS.map((key) => ({
    key,
    label: TRADE_CHART_LABEL[key],
    valor: despesaPorBucket.get(key) ?? 0,
    cor: TRADE_CHART_COLOR[key],
  }));

  const categoriasOrdenadas = Array.from(despesaPorCategoria.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const totalDespesaCategorias = categoriasOrdenadas.reduce(
    (acc, [, v]) => acc + v,
    0
  );

  const receitaTotal = ORDEM_BUCKETS.reduce(
    (acc, k) => acc + (receitaPorBucket.get(k) ?? 0),
    0
  );
  const despesaTotal = ORDEM_BUCKETS.reduce(
    (acc, k) => acc + (despesaPorBucket.get(k) ?? 0),
    0
  );
  const lucroTotal = receitaTotal - despesaTotal;
  const margem = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/financeiro"
              className="text-sm text-slate-500 hover:underline"
            >
              ← Financeiro
            </Link>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Dashboard financeiro
          </h1>
          <p className="text-sm text-slate-500">
            Receita, despesas e lucro por especialidade — obra, projeto,
            marcenaria, marmoraria e vidraçaria.
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
          {mes && (
            <Link
              href="/financeiro/dashboard"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Total (tudo)
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Receita {mes ? "do mês" : "total"}
          </p>
          <p className="mt-1 text-xl font-semibold text-emerald-600">
            {formatBRL(receitaTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Despesas {mes ? "do mês" : "total"}
          </p>
          <p className="mt-1 text-xl font-semibold text-red-600">
            {formatBRL(despesaTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Lucro {mes ? "do mês" : "total"}
          </p>
          <p
            className={`mt-1 text-xl font-semibold ${lucroTotal >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {formatBRL(lucroTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Margem de lucro
          </p>
          <p
            className={`mt-1 text-xl font-semibold ${margem >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {margem.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutChart titulo="Receita por especialidade" segments={receitaSegments} />
        <DonutChart titulo="Despesas por especialidade" segments={despesaSegments} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <p className="text-sm font-semibold text-slate-800">
          Todos os gastos, por categoria
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Soma de custos de obra + contas a pagar, agrupados pela categoria
          informada em cada lançamento.
        </p>
        <div className="mt-4 flex flex-col gap-2.5">
          {categoriasOrdenadas.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma despesa registrada {mes ? "neste mês" : "ainda"}.
            </p>
          ) : (
            categoriasOrdenadas.map(([categoria, valor]) => {
              const pct =
                totalDespesaCategorias > 0
                  ? (valor / totalDespesaCategorias) * 100
                  : 0;
              return (
                <div key={categoria} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{categoria}</span>
                    <span className="font-medium text-slate-900">
                      {formatBRL(valor)}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-ink-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <p className="text-sm font-semibold text-slate-800">
          Gasto e lucro por especialidade
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Obras turn-key (mais de uma especialidade marcada) entram em
          &quot;Turn-key&quot;; despesas sem obra vinculada entram em
          &quot;Despesas gerais&quot;.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">Especialidade</th>
                <th className="py-2 pr-4">Receita</th>
                <th className="py-2 pr-4">Despesa</th>
                <th className="py-2 pr-4">Lucro</th>
                <th className="py-2">Margem</th>
              </tr>
            </thead>
            <tbody>
              {ORDEM_BUCKETS.map((key) => {
                const receita = receitaPorBucket.get(key) ?? 0;
                const despesa = despesaPorBucket.get(key) ?? 0;
                const lucro = receita - despesa;
                const margemLinha = receita > 0 ? (lucro / receita) * 100 : 0;
                if (receita === 0 && despesa === 0) return null;
                return (
                  <tr
                    key={key}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2.5 pr-4">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: TRADE_CHART_COLOR[key] }}
                        />
                        {TRADE_CHART_LABEL[key]}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-emerald-600">
                      {formatBRL(receita)}
                    </td>
                    <td className="py-2.5 pr-4 text-red-600">
                      {formatBRL(despesa)}
                    </td>
                    <td
                      className={`py-2.5 pr-4 font-medium ${lucro >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {formatBRL(lucro)}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {receita > 0 ? `${margemLinha.toFixed(0)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
              {ORDEM_BUCKETS.every(
                (key) =>
                  (receitaPorBucket.get(key) ?? 0) === 0 &&
                  (despesaPorBucket.get(key) ?? 0) === 0
              ) && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Nenhum lançamento registrado {mes ? "neste mês" : "ainda"}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
