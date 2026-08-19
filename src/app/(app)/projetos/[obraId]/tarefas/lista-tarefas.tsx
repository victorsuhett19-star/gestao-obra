import Link from "next/link";
import {
  STATUS_TAREFA_LABEL,
  STATUS_TAREFA_COLOR,
  PRIORIDADE_TAREFA_LABEL,
  PRIORIDADE_TAREFA_COLOR,
  formatDateOnly,
} from "@/lib/labels";
import { excluirTarefa } from "@/app/actions/tarefas";

type Tarefa = {
  id: string;
  titulo: string;
  categoria: string | null;
  status: string;
  prioridade: string;
  dataInicio: Date | null;
  dataPrazo: Date | null;
  responsavel: { nome: string } | null;
};

export function ListaTarefas({ obraId, tarefas }: { obraId: string; tarefas: Tarefa[] }) {
  if (tarefas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
        <p className="text-sm text-slate-500">Nenhuma tarefa cadastrada ainda.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Tarefa</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Responsável</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Prioridade</th>
            <th className="px-4 py-3">Início</th>
            <th className="px-4 py-3">Prazo</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {tarefas.map((t) => (
            <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{t.titulo}</td>
              <td className="px-4 py-3 text-slate-600">{t.categoria ?? "—"}</td>
              <td className="px-4 py-3 text-slate-600">{t.responsavel?.nome ?? "—"}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TAREFA_COLOR[t.status]}`}>
                  {STATUS_TAREFA_LABEL[t.status]}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORIDADE_TAREFA_COLOR[t.prioridade]}`}>
                  {PRIORIDADE_TAREFA_LABEL[t.prioridade]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500">
                {t.dataInicio ? formatDateOnly(t.dataInicio) : "—"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {t.dataPrazo ? formatDateOnly(t.dataPrazo) : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3 text-xs">
                  <Link
                    href={`/projetos/${obraId}/tarefas/${t.id}/editar`}
                    className="font-medium text-slate-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <form action={excluirTarefa.bind(null, t.id, obraId)}>
                    <button type="submit" className="font-medium text-red-500 hover:underline">
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
  );
}
