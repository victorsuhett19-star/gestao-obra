import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  TIPO_LANCAMENTO_LABEL,
  TIPO_LANCAMENTO_COLOR,
  formatBRL,
  somarPorCategoria,
  categoriasOrdenadas,
  formatDateOnly as formatDate,
} from "@/lib/labels";
import { deleteLancamento } from "@/app/actions/financeiro";
import { DonutChart, type DonutSegment } from "@/app/(app)/financeiro/donut-chart";
import { AreaChart } from "@/app/(app)/financeiro/area-chart";

const MESES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function delta(atual: number, anterior: number) {
  if (anterior === 0) return atual === 0 ? null : 100;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

function DeltaBadge({ valor, invertido = false }: { valor: number | null; invertido?: boolean }) {
  if (valor === null) return <span className="text-xs text-slate-400">— vs mês anterior</span>;
  const bom = invertido ? valor <= 0 : valor >= 0;
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-400">
      <span className={`rounded-full px-2 py-0.5 font-semibold ${bom ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}>
        {valor >= 0 ? "▲" : "▼"} {Math.abs(valor).toFixed(1)}%
      </span>
      vs mês anterior
    </span>
  );
}

function Glow({ cor }: { cor: string }) {
  return <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${cor}`} />;
}

export const metadata: Metadata = {
  title: "Financeiro do projeto — VS Gestão de Obra",
};

// Paleta cíclica pras categorias de gasto (livres, definidas pelo usuário no
// lançamento) — diferente da paleta fixa por especialidade do dashboard
// financeiro geral, aqui não sabemos os nomes de antemão.
const PALETA = ["#2563eb", "#b45309", "#7c3aed", "#0891b2", "#dc2626", "#16a34a", "#ca8a04", "#64748b"];

export default async function FinanceiroProjetoPage({
  params,
}: PageProps<"/projetos/[obraId]/financeiro">) {
  const { obraId } = await params;
  const voltarPara = `/projetos/${obraId}/financeiro`;

  const [lancamentos, orcadoAgg] = await Promise.all([
    prisma.lancamentoFinanceiro.findMany({
      where: { obraId },
      orderBy: { data: "desc" },
    }),
    prisma.itemOrcamento.aggregate({ where: { obraId }, _sum: { valorTotal: true } }),
  ]);

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const realizados = lancamentos.filter((l) => l.data <= hoje);
  const previstos = lancamentos.filter((l) => l.data > hoje);

  const custo = realizados.filter((l) => l.tipo === "CUSTO").reduce((acc, l) => acc + l.valor, 0);
  const receita = realizados.filter((l) => l.tipo === "RECEITA").reduce((acc, l) => acc + l.valor, 0);
  const custoPrevisto = previstos.filter((l) => l.tipo === "CUSTO").reduce((acc, l) => acc + l.valor, 0);
  const receitaPrevista = previstos.filter((l) => l.tipo === "RECEITA").reduce((acc, l) => acc + l.valor, 0);
  const lucro = receita - custo;
  const margem = receita > 0 ? (lucro / receita) * 100 : 0;
  const orcado = orcadoAgg._sum.valorTotal ?? 0;

  const custoPorCategoria = new Map<string, { label: string; valor: number }>();
  for (const l of realizados) {
    if (l.tipo !== "CUSTO") continue;
    somarPorCategoria(custoPorCategoria, l.categoria, l.valor);
  }
  const categoriasOrd = categoriasOrdenadas(custoPorCategoria);
  // Série mensal: 3 meses atrás até 2 à frente (inclui os previstos).
  const agora = new Date();
  const mesesSerie = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(agora.getFullYear(), agora.getMonth() - 3 + i, 1));
    return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() };
  });
  const serieReceita = mesesSerie.map(() => 0);
  const serieDespesa = mesesSerie.map(() => 0);
  for (const l of lancamentos) {
    const i = mesesSerie.findIndex((m) => m.ano === l.data.getUTCFullYear() && m.mes === l.data.getUTCMonth());
    if (i < 0) continue;
    if (l.tipo === "RECEITA") serieReceita[i] += l.valor;
    else if (l.tipo === "CUSTO") serieDespesa[i] += l.valor;
  }
  const serieLucro = serieReceita.map((r, i) => r - serieDespesa[i]);
  const dReceita = delta(serieReceita[3], serieReceita[2]);
  const dDespesa = delta(serieDespesa[3], serieDespesa[2]);
  const dLucro = delta(serieLucro[3], serieLucro[2]);
  const segments: DonutSegment[] = categoriasOrd.map(([label, valor], i) => ({
    key: label,
    label,
    valor,
    cor: PALETA[i % PALETA.length],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Financeiro</h2>
          <p className="text-sm text-slate-500">
            Todo gasto deste projeto — visitas ao cliente, impressão, alimentação,
            material, o que for. Lance com data futura pra prever receitas e
            custos que ainda vão acontecer.
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/financeiro/novo?voltarPara=${voltarPara}`}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Novo lançamento
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card relative overflow-hidden p-5">
          <Glow cor="bg-sky-500/20" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Orçado</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatBRL(orcado)}</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500" style={{ width: `${orcado > 0 ? Math.min(100, (custo / orcado) * 100) : 0}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-400">{orcado > 0 ? `${((custo / orcado) * 100).toFixed(0)}% do orçado gasto` : "Sem orçamento"}</p>
        </div>
        <div className="card relative overflow-hidden p-5">
          <Glow cor="bg-emerald-500/20" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Receita</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatBRL(receita)}</p>
          <div className="mt-2"><DeltaBadge valor={dReceita} /></div>
        </div>
        <div className="card relative overflow-hidden p-5">
          <Glow cor="bg-red-500/20" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gasto total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatBRL(custo)}</p>
          <div className="mt-2"><DeltaBadge valor={dDespesa} invertido /></div>
        </div>
        <div className="card relative overflow-hidden p-5">
          <Glow cor="bg-amber-500/20" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lucro / margem</p>
          <p className={`mt-2 text-2xl font-semibold ${lucro >= 0 ? "text-emerald-500" : "text-red-500"}`}>{formatBRL(lucro)}</p>
          <div className="mt-2 flex items-center gap-2"><DeltaBadge valor={dLucro} /><span className="text-xs text-slate-400">· margem {margem.toFixed(1)}%</span></div>
        </div>
      </div>

      <AreaChart
        titulo="Receita, gastos e lucro do projeto — por mês (inclui previstos)"
        labels={mesesSerie.map((m) => MESES_CURTO[m.mes])}
        series={[
          { key: "receita", label: "Receita", cor: "#10b981", valores: serieReceita },
          { key: "despesa", label: "Gastos", cor: "#ef4444", valores: serieDespesa },
          { key: "lucro", label: "Lucro", cor: "#f59e0b", valores: serieLucro },
        ]}
      />

      {(receitaPrevista > 0 || custoPrevisto > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card border-dashed p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              📅 Receita prevista (datas futuras)
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-600">
              {formatBRL(receitaPrevista)}
            </p>
          </div>
          <div className="card border-dashed p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              📅 Custo previsto (datas futuras)
            </p>
            <p className="mt-1 text-lg font-semibold text-red-600">
              {formatBRL(custoPrevisto)}
            </p>
          </div>
        </div>
      )}

      <DonutChart titulo="Todo gasto já realizado deste projeto, por categoria" segments={segments} />

      {lancamentos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">Nenhum gasto lançado ainda.</p>
          <Link
            href={`/obras/${obraId}/financeiro/novo?voltarPara=${voltarPara}`}
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo lançamento
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => {
                const previsto = l.data > hoje;
                return (
                <tr key={l.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${previsto ? "bg-amber-50/40" : ""}`}>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(l.data)}
                    {previsto && (
                      <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        Previsto
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{l.descricao}</td>
                  <td className="px-4 py-3 text-slate-600">{l.categoria ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_LANCAMENTO_COLOR[l.tipo]}`}>
                      {TIPO_LANCAMENTO_LABEL[l.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatBRL(l.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <Link
                        href={`/obras/${obraId}/financeiro/${l.id}/editar?voltarPara=${voltarPara}`}
                        className="font-medium text-slate-600 hover:underline"
                      >
                        Editar
                      </Link>
                      <form action={deleteLancamento.bind(null, l.id, obraId)}>
                        <button
                          type="submit"
                          className="font-medium text-red-500 hover:underline"
                        >
                          Excluir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
