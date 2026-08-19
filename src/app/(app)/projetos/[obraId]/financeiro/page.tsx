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

export const metadata: Metadata = {
  title: "Financeiro do projeto — Gestão de Obra",
};

export default async function FinanceiroProjetoPage({
  params,
}: PageProps<"/projetos/[obraId]/financeiro">) {
  const { obraId } = await params;
  const voltarPara = `/projetos/${obraId}/financeiro`;

  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    where: { obraId },
    orderBy: { data: "desc" },
  });

  const custo = lancamentos.filter((l) => l.tipo === "CUSTO").reduce((acc, l) => acc + l.valor, 0);
  const receita = lancamentos.filter((l) => l.tipo === "RECEITA").reduce((acc, l) => acc + l.valor, 0);
  const lucro = receita - custo;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Financeiro</h2>
          <p className="text-sm text-slate-500">
            Todo gasto deste projeto — visitas ao cliente, impressão, alimentação,
            material, o que for. Inclua ou exclua a qualquer momento.
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/financeiro/novo?voltarPara=${voltarPara}`}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Novo lançamento
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Receita</p>
          <p className="mt-1 text-lg font-semibold text-emerald-600">{formatBRL(receita)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gasto total</p>
          <p className="mt-1 text-lg font-semibold text-red-600">{formatBRL(custo)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lucro</p>
          <p className={`mt-1 text-lg font-semibold ${lucro >= 0 ? "text-slate-900" : "text-red-600"}`}>
            {formatBRL(lucro)}
          </p>
        </div>
      </div>

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
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-surface">
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
              {lancamentos.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{formatDate(l.data)}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
