import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/labels";
import { DonutChart, type DonutSegment } from "@/app/(app)/financeiro/donut-chart";

export const metadata: Metadata = {
  title: "Dashboard do projeto — Gestão de Obra",
};

// Paleta cíclica pras categorias de gasto (livres, definidas pelo usuário no
// lançamento) — diferente da paleta fixa por especialidade do dashboard
// financeiro geral, aqui não sabemos os nomes de antemão.
const PALETA = ["#2563eb", "#b45309", "#7c3aed", "#0891b2", "#dc2626", "#16a34a", "#ca8a04", "#64748b"];

export default async function DashboardProjetoPage({
  params,
}: PageProps<"/projetos/[obraId]/dashboard">) {
  const { obraId } = await params;

  const [obra, lancamentos, orcadoAgg] = await Promise.all([
    prisma.obra.findUnique({ where: { id: obraId }, select: { nome: true } }),
    prisma.lancamentoFinanceiro.findMany({ where: { obraId } }),
    prisma.itemOrcamento.aggregate({ where: { obraId }, _sum: { valorTotal: true } }),
  ]);

  const receita = lancamentos.filter((l) => l.tipo === "RECEITA").reduce((acc, l) => acc + l.valor, 0);
  const despesa = lancamentos.filter((l) => l.tipo === "CUSTO").reduce((acc, l) => acc + l.valor, 0);
  const lucro = receita - despesa;
  const margem = receita > 0 ? (lucro / receita) * 100 : 0;
  const orcado = orcadoAgg._sum.valorTotal ?? 0;

  const despesaPorCategoria = new Map<string, number>();
  for (const l of lancamentos) {
    if (l.tipo !== "CUSTO") continue;
    const chave = l.categoria?.trim() || "Sem categoria";
    despesaPorCategoria.set(chave, (despesaPorCategoria.get(chave) ?? 0) + l.valor);
  }
  const categoriasOrdenadas = Array.from(despesaPorCategoria.entries()).sort((a, b) => b[1] - a[1]);
  const segments: DonutSegment[] = categoriasOrdenadas.map(([label, valor], i) => ({
    key: label,
    label,
    valor,
    cor: PALETA[i % PALETA.length],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Dashboard financeiro — {obra?.nome}
        </h2>
        <p className="text-sm text-slate-500">
          Receita, gastos e lucro deste projeto específico.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Orçado</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{formatBRL(orcado)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Receita</p>
          <p className="mt-1 text-xl font-semibold text-emerald-600">{formatBRL(receita)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gasto total</p>
          <p className="mt-1 text-xl font-semibold text-red-600">{formatBRL(despesa)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lucro / margem</p>
          <p className={`mt-1 text-xl font-semibold ${lucro >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {formatBRL(lucro)}{" "}
            <span className="text-sm font-normal text-slate-400">({margem.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      <DonutChart titulo="Todo gasto deste projeto, por categoria" segments={segments} />
    </div>
  );
}
