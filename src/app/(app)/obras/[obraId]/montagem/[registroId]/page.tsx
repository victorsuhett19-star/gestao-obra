import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_MONTAGEM_LABEL, STATUS_MONTAGEM_COLOR, formatBRL } from "@/lib/labels";
import { STATUS_MONTAGEM } from "@/lib/definitions";
import {
  alternarItemExtra,
  alternarFaltaFabrica,
  atualizarStatusMontagem,
  deleteMontagem,
} from "@/app/actions/montagem";

export const metadata: Metadata = {
  title: "Registro de montagem — Gestão de Obra",
};

export default async function MontagemDetailPage({
  params,
}: PageProps<"/obras/[obraId]/montagem/[registroId]">) {
  const { obraId, registroId } = await params;

  const registro = await prisma.registroMontagem.findUnique({
    where: { id: registroId },
    include: {
      montador: true,
      ambientes: true,
      itensExtras: true,
      faltasFabrica: true,
    },
  });

  if (!registro) {
    notFound();
  }

  const pendencias =
    registro.itensExtras.filter((i) => !i.recebido).length +
    registro.faltasFabrica.filter((f) => !f.recebido).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/obras/${obraId}/montagem`}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← Montagem
          </Link>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {registro.ambientes.map((a) => a.nome).join(", ") || "Registro de montagem"}
          </h2>
          <p className="text-sm text-slate-500">
            {registro.montador?.nome ?? "Sem montador definido"} · Total{" "}
            {formatBRL(registro.valorTotal)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_MONTAGEM_COLOR[registro.status]}`}
        >
          {STATUS_MONTAGEM_LABEL[registro.status]}
        </span>
      </div>

      {pendencias > 0 && registro.status === "FILA" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {pendencias} pendência(s) — marque os itens extras e faltas de fábrica
          como recebidos para liberar o início da montagem.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {STATUS_MONTAGEM.map((s) => (
          <form key={s} action={atualizarStatusMontagem.bind(null, registro.id, obraId, s)}>
            <button
              type="submit"
              disabled={registro.status === s}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-default disabled:opacity-40"
            >
              Marcar como {STATUS_MONTAGEM_LABEL[s]}
            </button>
          </form>
        ))}
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Ambiente</th>
              <th className="px-4 py-3">Nº pedido</th>
              <th className="px-4 py-3">Nota fiscal</th>
              <th className="px-4 py-3 text-right">Volumes</th>
              <th className="px-4 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {registro.ambientes.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{a.nome}</td>
                <td className="px-4 py-3 text-slate-600">{a.numeroPedido ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{a.notaFiscal ?? "—"}</td>
                <td className="px-4 py-3 text-right text-slate-600">
                  {a.qtdVolumes ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatBRL(a.valor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {registro.itensExtras.length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800">Itens extras</p>
          <div className="mt-2 flex flex-col gap-1">
            {registro.itensExtras.map((item) => (
              <form
                key={item.id}
                action={alternarItemExtra.bind(null, item.id, obraId)}
                className="flex items-center gap-2"
              >
                <button
                  type="submit"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                    item.recebido
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 text-transparent hover:border-slate-500"
                  }`}
                >
                  ✓
                </button>
                <span
                  className={`text-sm ${item.recebido ? "text-slate-400 line-through" : "text-slate-800"}`}
                >
                  {item.descricao} ({item.quantidade})
                </span>
              </form>
            ))}
          </div>
        </div>
      )}

      {registro.faltasFabrica.length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold text-slate-800">
            Faltas de fábrica
          </p>
          <div className="mt-2 flex flex-col gap-1">
            {registro.faltasFabrica.map((falta) => (
              <form
                key={falta.id}
                action={alternarFaltaFabrica.bind(null, falta.id, obraId)}
                className="flex items-center gap-2"
              >
                <button
                  type="submit"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                    falta.recebido
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 text-transparent hover:border-slate-500"
                  }`}
                >
                  ✓
                </button>
                <span
                  className={`text-sm ${falta.recebido ? "text-slate-400 line-through" : "text-slate-800"}`}
                >
                  Pedido {falta.numeroPedido} · Volume {falta.numeroVolume}
                </span>
              </form>
            ))}
          </div>
        </div>
      )}

      <form
        action={async () => {
          "use server";
          await deleteMontagem(registro.id, obraId);
          redirect(`/obras/${obraId}/montagem`);
        }}
      >
        <button type="submit" className="text-sm font-medium text-red-500 hover:underline">
          Excluir registro
        </button>
      </form>
    </div>
  );
}
