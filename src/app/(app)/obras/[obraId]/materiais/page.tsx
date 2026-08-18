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

export const metadata: Metadata = {
  title: "Materiais — Gestão de Obra",
};

// dataPedido é um timestamp real (default now()) — fuso local, sem bug.
function formatDate(date: Date | null) {
  if (!date) return "—";
  return formatTimestamp(date);
}

// dataEntregaPrevista/Real vêm de <input type="date"> — precisam de UTC.
function formatDatePrevista(date: Date | null) {
  if (!date) return "—";
  return formatDateOnly(date);
}

export default async function MateriaisObraPage({
  params,
}: PageProps<"/obras/[obraId]/materiais">) {
  const { obraId } = await params;

  const pedidos = await prisma.pedidoMaterial.findMany({
    where: { obraId },
    include: { fornecedor: { select: { nome: true } }, itens: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Materiais e pedidos
          </h2>
          <p className="text-sm text-slate-500">
            {pedidos.length} pedido(s) de material para esta obra.
          </p>
        </div>
        <Link
          href={`/obras/${obraId}/materiais/novo`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo pedido
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum pedido de material cadastrado ainda.
          </p>
          <Link
            href={`/obras/${obraId}/materiais/novo`}
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Novo pedido
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((p) => (
            <Link
              key={p.id}
              href={`/obras/${obraId}/materiais/${p.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {p.fornecedor.nome}
                </p>
                <p className="text-xs text-slate-500">
                  {p.itens.length} item(ns) · Pedido em {formatDate(p.dataPedido)}
                  {p.dataEntregaPrevista &&
                    ` · Entrega prevista ${formatDatePrevista(p.dataEntregaPrevista)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-900">
                  {formatBRL(p.valorTotal)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PEDIDO_COLOR[p.status]}`}
                >
                  {STATUS_PEDIDO_LABEL[p.status]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
