import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  STATUS_PEDIDO_LABEL,
  STATUS_PEDIDO_COLOR,
  formatBRL,
  formatDate as formatTimestamp,
  formatDateOnly,
} from "@/lib/labels";
import { STATUS_PEDIDO } from "@/lib/definitions";
import { atualizarStatusPedido, deletePedido } from "@/app/actions/pedidos";

export const metadata: Metadata = {
  title: "Pedido de material — Gestão de Obra",
};

// dataPedido/dataEntregaReal são timestamps reais (fuso local); já
// dataEntregaPrevista vem de <input type="date"> (precisa ser lida em UTC).
function formatDate(date: Date | null) {
  if (!date) return "—";
  return formatTimestamp(date);
}

function formatDatePrevista(date: Date | null) {
  if (!date) return "—";
  return formatDateOnly(date);
}

export default async function PedidoDetailPage({
  params,
}: PageProps<"/obras/[obraId]/materiais/[pedidoId]">) {
  const { obraId, pedidoId } = await params;

  const pedido = await prisma.pedidoMaterial.findUnique({
    where: { id: pedidoId },
    include: {
      fornecedor: true,
      itens: { include: { material: true } },
    },
  });

  if (!pedido) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/obras/${obraId}/materiais`}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← Pedidos
          </Link>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Pedido — {pedido.fornecedor.nome}
          </h2>
          <p className="text-sm text-slate-500">
            Pedido em {formatDate(pedido.dataPedido)} · Entrega prevista{" "}
            {formatDatePrevista(pedido.dataEntregaPrevista)}
            {pedido.dataEntregaReal &&
              ` · Entregue em ${formatDate(pedido.dataEntregaReal)}`}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_PEDIDO_COLOR[pedido.status]}`}
        >
          {STATUS_PEDIDO_LABEL[pedido.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_PEDIDO.map((s) => (
          <form
            key={s}
            action={async () => {
              "use server";
              await atualizarStatusPedido(pedido.id, obraId, s);
            }}
          >
            <button
              type="submit"
              disabled={pedido.status === s}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"
            >
              Marcar como {STATUS_PEDIDO_LABEL[s]}
            </button>
          </form>
        ))}
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3 text-right">Qtd.</th>
              <th className="px-4 py-3 text-right">Vlr. unit.</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {pedido.itens.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.material.nome}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {item.quantidade} {item.material.unidade}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {formatBRL(item.valorUnitario)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatBRL(item.valorTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-slate-500">
                Total do pedido
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                {formatBRL(pedido.valorTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form
        action={async () => {
          "use server";
          await deletePedido(pedido.id, obraId);
          redirect(`/obras/${obraId}/materiais`);
        }}
      >
        <button
          type="submit"
          className="text-sm font-medium text-red-500 hover:underline"
        >
          Excluir pedido
        </button>
      </form>
    </div>
  );
}
