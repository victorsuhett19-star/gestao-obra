import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_ITEM_VISTORIA_LABEL, STATUS_ITEM_VISTORIA_COLOR } from "@/lib/labels";
import { assinarVistoria, deleteVistoria } from "@/app/actions/vistoria";

export const metadata: Metadata = {
  title: "Relatório de vistoria — Gestão de Obra",
};

function formatDateTime(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function VistoriaDetailPage({
  params,
}: PageProps<"/obras/[obraId]/vistoria/[vistoriaId]">) {
  const { obraId, vistoriaId } = await params;

  const [vistoria, obra] = await Promise.all([
    prisma.vistoriaFinal.findUnique({
      where: { id: vistoriaId },
      include: { responsavel: true, itens: true },
    }),
    prisma.obra.findUnique({ where: { id: obraId } }),
  ]);

  if (!vistoria || !obra) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/obras/${obraId}/vistoria`}
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Vistoria final
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="border-b border-slate-200 pb-3 text-center text-base font-semibold uppercase tracking-wide text-slate-800">
          Relatório de supervisão
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Cliente</p>
            <p className="text-slate-900">{obra.clienteNome ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Obra</p>
            <p className="text-slate-900">{obra.nome}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Data da vistoria
            </p>
            <p className="text-slate-900">
              {new Intl.DateTimeFormat("pt-BR").format(vistoria.dataVistoria)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Responsável pela vistoria
            </p>
            <p className="text-slate-900">{vistoria.responsavel?.nome ?? "—"}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {vistoria.itens.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-slate-200">
              <div className="bg-slate-800 px-3 py-2 text-sm font-medium text-white">
                {item.ambiente}
              </div>
              <div
                className={`px-3 py-2 text-center text-sm font-medium ${STATUS_ITEM_VISTORIA_COLOR[item.status]}`}
              >
                {STATUS_ITEM_VISTORIA_LABEL[item.status]}
              </div>
              {item.observacao && (
                <p className="border-t border-slate-100 px-3 py-2 text-sm text-slate-600">
                  {item.observacao}
                </p>
              )}
            </div>
          ))}
        </div>

        {vistoria.observacoesCliente && (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Observações do cliente
            </p>
            <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {vistoria.observacoesCliente}
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              {vistoria.responsavel?.nome ?? "Responsável"}
            </p>
            <p className="text-xs text-slate-500">Responsável da vistoria</p>
            {vistoria.assinadoResponsavelEm ? (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                Assinado em {formatDateTime(vistoria.assinadoResponsavelEm)}
              </p>
            ) : (
              <form action={assinarVistoria.bind(null, vistoria.id, obraId, "responsavel")}>
                <button
                  type="submit"
                  className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Assinar como responsável
                </button>
              </form>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">
              {obra.clienteNome ?? "Cliente"}
            </p>
            <p className="text-xs text-slate-500">Cliente</p>
            {vistoria.assinadoClienteEm ? (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                Assinado em {formatDateTime(vistoria.assinadoClienteEm)}
              </p>
            ) : (
              <form action={assinarVistoria.bind(null, vistoria.id, obraId, "cliente")}>
                <button
                  type="submit"
                  className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Assinar como cliente
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <form
        action={async () => {
          "use server";
          await deleteVistoria(vistoria.id, obraId);
          redirect(`/obras/${obraId}/vistoria`);
        }}
      >
        <button type="submit" className="text-sm font-medium text-red-500 hover:underline">
          Excluir relatório
        </button>
      </form>
    </div>
  );
}
