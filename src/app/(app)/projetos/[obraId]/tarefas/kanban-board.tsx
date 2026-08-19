"use client";

import { useRouter } from "next/navigation";
import { useState, type DragEvent } from "react";
import Link from "next/link";
import { moverTarefaStatus } from "@/app/actions/tarefas";
import { STATUS_TAREFA } from "@/lib/definitions";
import { STATUS_TAREFA_LABEL, PRIORIDADE_TAREFA_LABEL, PRIORIDADE_TAREFA_COLOR, formatDateOnly } from "@/lib/labels";

type Tarefa = {
  id: string;
  titulo: string;
  categoria: string | null;
  status: string;
  prioridade: string;
  dataPrazo: Date | null;
  responsavel: { nome: string } | null;
  _count: { dependeDe: number };
};

export function KanbanBoard({
  obraId,
  tarefas,
}: {
  obraId: string;
  tarefas: Tarefa[];
}) {
  const router = useRouter();
  const [arrastando, setArrastando] = useState<string | null>(null);

  async function onDrop(e: DragEvent, status: string) {
    e.preventDefault();
    const tarefaId = e.dataTransfer.getData("text/tarefa-id");
    if (!tarefaId) return;
    await moverTarefaStatus(obraId, tarefaId, status);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATUS_TAREFA.map((status) => {
        const itens = tarefas.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, status)}
            className="flex flex-col gap-2 rounded-2xl bg-slate-100/60 p-3"
          >
            <div className="flex items-center gap-2 px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {STATUS_TAREFA_LABEL[status]}
              </p>
              <span className="rounded-full bg-slate-200 px-1.5 text-[11px] text-slate-500">
                {itens.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {itens.map((t) => (
                <Link
                  key={t.id}
                  href={`/projetos/${obraId}/tarefas/${t.id}/editar`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/tarefa-id", t.id);
                    setArrastando(t.id);
                  }}
                  onDragEnd={() => setArrastando(null)}
                  className={`flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 ${arrastando === t.id ? "opacity-40" : ""}`}
                >
                  <span
                    className={`w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PRIORIDADE_TAREFA_COLOR[t.prioridade]}`}
                  >
                    {PRIORIDADE_TAREFA_LABEL[t.prioridade]}
                  </span>
                  <p className="text-sm font-medium text-slate-900">{t.titulo}</p>
                  {t.categoria && (
                    <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                      {t.categoria}
                    </span>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    {t.responsavel ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-white">
                        {t.responsavel.nome
                          .split(" ")
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-2">
                      {t._count.dependeDe > 0 && <span>🔗 {t._count.dependeDe}</span>}
                      {t.dataPrazo && <span>📅 {formatDateOnly(t.dataPrazo)}</span>}
                    </span>
                  </div>
                </Link>
              ))}
              {itens.length === 0 && (
                <p className="px-1 py-4 text-center text-xs text-slate-400">
                  Nenhuma tarefa
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

