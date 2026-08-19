import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIA_ORCAMENTO_LABEL, formatBRL } from "@/lib/labels";
import { deleteItemOrcamento } from "@/app/actions/orcamento";

export const metadata: Metadata = {
  title: "Orçamento — Gestão de Obra",
};

export default async function OrcamentoPage({
  params,
}: PageProps<"/obras/[obraId]/orcamento">) {
  const { obraId } = await params;

  const itens = await prisma.itemOrcamento.findMany({
    where: { obraId },
    include: { etapa: { select: { nome: true } } },
    orderBy: { criadoEm: "asc" },
  });

  const total = itens.reduce((acc, i) => acc + i.valorTotal, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Orçamento</h2>
          <p className="text-sm text-slate-500">
            {itens.length} item(ns) · Total orçado: {formatBRL(total)}
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/orcamento/novo`}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Novo item
        </Link>
      </div>

      {itens.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum item orçado ainda. Adicione materiais, mão de obra, serviços
            e equipamentos previstos para esta obra.
          </p>
          <Link
            href={`/obras/${obraId}/orcamento/novo`}
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo item
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3 text-right">Qtd.</th>
                <th className="px-4 py-3 text-right">Vlr. unit.</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.descricao}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {CATEGORIA_ORCAMENTO_LABEL[item.categoria]}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.etapa?.nome ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {item.quantidade}
                    {item.unidade ? ` ${item.unidade}` : ""}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {formatBRL(item.valorUnitario)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatBRL(item.valorTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-xs">
                      <Link
                        href={`/obras/${obraId}/orcamento/${item.id}/editar`}
                        className="font-medium text-slate-600 hover:underline"
                      >
                        Editar
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteItemOrcamento(item.id, obraId);
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
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                  Total orçado
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                  {formatBRL(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
