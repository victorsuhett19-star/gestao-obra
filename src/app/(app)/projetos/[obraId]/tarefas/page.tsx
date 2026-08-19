import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { KanbanBoard } from "./kanban-board";
import { GanttChart } from "./gantt-chart";
import { ListaTarefas } from "./lista-tarefas";
import { CalendarioView } from "./calendario-view";

export const metadata: Metadata = {
  title: "Tarefas — Gestão de Obra",
};

const VIEWS = [
  { id: "kanban", label: "Kanban" },
  { id: "gantt", label: "Gantt" },
  { id: "lista", label: "Lista" },
  { id: "calendario", label: "Calendário" },
] as const;

export default async function TarefasPage({
  params,
  searchParams,
}: PageProps<"/projetos/[obraId]/tarefas">) {
  const { obraId } = await params;
  const sp = await searchParams;
  const view = typeof sp.view === "string" ? sp.view : "kanban";
  const hoje = new Date();
  const ano = typeof sp.ano === "string" ? Number(sp.ano) : hoje.getUTCFullYear();
  const mes = typeof sp.mes === "string" ? Number(sp.mes) : hoje.getUTCMonth();

  const empresaAtivaId = await getEmpresaAtivaId();

  const [tarefas, eventos] = await Promise.all([
    prisma.tarefa.findMany({
      where: { obraId },
      include: {
        responsavel: { select: { nome: true } },
        dependeDe: { include: { dependeDe: { select: { titulo: true } } } },
        _count: { select: { dependeDe: true } },
      },
      orderBy: { ordem: "asc" },
    }),
    view === "calendario"
      ? prisma.evento.findMany({
          where: { obraId, empresaId: empresaAtivaId ?? undefined },
          select: { id: true, titulo: true, data: true, cor: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tarefas</h2>
          <p className="text-sm text-slate-500">
            {tarefas.length} tarefa(s) — prazos com dependência se recalculam
            sozinhos.
          </p>
        </div>
        <Link
          href={`/projetos/${obraId}/tarefas/nova`}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Nova tarefa
        </Link>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            href={`/projetos/${obraId}/tarefas?view=${v.id}`}
            className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
              view === v.id
                ? "border-ink-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {view === "kanban" && <KanbanBoard obraId={obraId} tarefas={tarefas} />}
      {view === "gantt" && <GanttChart tarefas={tarefas} />}
      {view === "lista" && <ListaTarefas obraId={obraId} tarefas={tarefas} />}
      {view === "calendario" && (
        <CalendarioView obraId={obraId} ano={ano} mes={mes} eventos={eventos} tarefas={tarefas} />
      )}
    </div>
  );
}
