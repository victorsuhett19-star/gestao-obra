import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  TIPO_LANCAMENTO_LABEL,
  TIPO_LANCAMENTO_COLOR,
  formatBRL,
  formatDateOnly as formatDate,
} from "@/lib/labels";
import { deleteLancamento } from "@/app/actions/financeiro";
import { DonutChart, type DonutSegment } from "@/app/(app)/financeiro/donut-chart";

export const metadata: Metadata = {
  title: "Financeiro — VS Gestão de Obra",
};

// Paleta cíclica pras categorias de gasto (livres, definidas pelo usuário no
// lançamento) — mesma usada no dashboard financeiro do projeto.
const PALETA = ["#2563eb", "#b45309", "#7c3aed", "#0891b2", "#dc2626", "#16a34a", "#ca8a04", "#64748b"];

export default async function FinanceiroPage({
  params,
}: PageProps<"/obras/[obraId]/financeiro">) {
  const { obraId } = await params;

  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    where: { obraId },
    orderBy: { data: "desc" },
  });

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const realizados = lancamentos.filter((l) => l.data <= hoje);
  const previstos = lancamentos.filter((l) => l.data > hoje);

  const custo = realizados
    .filter((l) => l.tipo === "CUSTO")
    .reduce((acc, l) => acc + l.valor, 0);
  const receita = realizados
    .filter((l) => l.tipo === "RECEITA")
    .reduce((acc, l) => acc + l.valor, 0);
  const custoPrevisto = previstos
    .filter((l) => l.tipo === "CUSTO")
    .reduce((acc, l) => acc + l.valor, 0);
  const receitaPrevista = previstos
    .filter((l) => l.tipo === "RECEITA")
    .reduce((acc, l) => acc + l.valor, 0);
  const pagamento = lancamentos
    .filter((l) => l.tipo === "PAGAMENTO")
    .reduce((acc, l) => acc + l.valor, 0);
  const lucro = receita - custo;

  const custoPorCategoria = new Map<string, number>();
  for (const l of realizados) {
    if (l.tipo !== "CUSTO") continue;
    const chave = l.categoria?.trim() || "Sem categoria";
    custoPorCategoria.set(chave, (custoPorCategoria.get(chave) ?? 0) + l.valor);
  }
  const categoriasOrdenadas = Array.from(custoPorCategoria.entries()).sort((a, b) => b[1] - a[1]);
  const segments: DonutSegment[] = categoriasOrdenadas.map(([label, valor], i) => ({
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
            Lançamentos financeiros e consumo por categoria da obra. Lance
            com data futura pra prever receitas e custos que ainda vão
            acontecer.
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/financeiro/novo`}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Novo lançamento
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Custo realizado
          </p>
          <p className="mt-1 text-lg font-semibold text-red-600">
            {formatBRL(custo)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Receita
          </p>
          <p className="mt-1 text-lg font-semibold text-emerald-600">
            {formatBRL(receita)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Lucro (receita − custo)
          </p>
          <p
            className={`mt-1 text-lg font-semibold ${lucro < 0 ? "text-red-600" : "text-emerald-600"}`}
          >
            {formatBRL(lucro)}
          </p>
        </div>
      </div>

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

      <DonutChart titulo="Consumo já realizado da obra, por categoria" segments={segments} />

      {pagamento > 0 && (
        <p className="text-sm text-slate-500">
          Total pago ao longo da obra: {formatBRL(pagamento)}
        </p>
      )}

      {lancamentos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum lançamento financeiro ainda.
          </p>
          <Link
            href={`/obras/${obraId}/financeiro/novo`}
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
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Forma</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => {
                const previsto = l.data > hoje;
                return (
                <tr
                  key={l.id}
                  className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${previsto ? "bg-amber-50/40" : ""}`}
                >
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(l.data)}
                    {previsto && (
                      <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        Previsto
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {l.descricao}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPO_LANCAMENTO_COLOR[l.tipo]}`}
                    >
                      {TIPO_LANCAMENTO_LABEL[l.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {l.formaPagamento ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatBRL(l.valor)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <Link
                        href={`/obras/${obraId}/financeiro/${l.id}/editar`}
                        className="font-medium text-slate-600 hover:underline"
                      >
                        Editar
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteLancamento(l.id, obraId);
                        }}
                      >
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
