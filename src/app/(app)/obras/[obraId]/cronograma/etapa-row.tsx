import Link from "next/link";
import { STATUS_ETAPA_LABEL, STATUS_ETAPA_COLOR } from "@/lib/labels";
import { deleteEtapa } from "@/app/actions/etapas";
import type { EtapaTreeNode } from "@/lib/etapa-tree";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function EtapaRow({
  node,
  obraId,
}: {
  node: EtapaTreeNode;
  obraId: string;
}) {
  return (
    <>
      <div
        className="flex flex-wrap items-center gap-3 border-b border-slate-100 py-3 last:border-0"
        style={{ paddingLeft: `${node.depth * 24}px` }}
      >
        <div className="min-w-[220px] flex-1">
          <p className="text-sm font-medium text-slate-900">{node.nome}</p>
          <p className="text-xs text-slate-500">
            {formatDate(node.dataInicioPrevista)} → {formatDate(node.dataFimPrevista)}
            {node.responsavel && <> · {node.responsavel.nome}</>}
          </p>
        </div>

        <div className="flex w-32 items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900"
              style={{ width: `${node.percentualConcluido}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs text-slate-500">
            {node.percentualConcluido}%
          </span>
        </div>

        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_ETAPA_COLOR[node.status]}`}
        >
          {STATUS_ETAPA_LABEL[node.status]}
        </span>

        <div className="flex items-center gap-3 text-xs">
          <Link
            href={`/obras/${obraId}/cronograma/novo?paiId=${node.id}`}
            className="font-medium text-slate-600 hover:underline"
          >
            + Subetapa
          </Link>
          <Link
            href={`/obras/${obraId}/cronograma/${node.id}/editar`}
            className="font-medium text-slate-600 hover:underline"
          >
            Editar
          </Link>
          <form
            action={async () => {
              "use server";
              await deleteEtapa(node.id, obraId);
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
      </div>

      {node.filhos.map((filho) => (
        <EtapaRow key={filho.id} node={filho} obraId={obraId} />
      ))}
    </>
  );
}
