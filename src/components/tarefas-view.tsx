import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { KanbanBoard } from "@/app/(app)/projetos/[obraId]/tarefas/kanban-board";
import { GanttChart } from "@/app/(app)/projetos/[obraId]/tarefas/gantt-chart";
import { ListaTarefas } from "@/app/(app)/projetos/[obraId]/tarefas/lista-tarefas";
import { CalendarioView } from "@/app/(app)/projetos/[obraId]/tarefas/calendario-view";

const VIEWS = [
  { id: "kanban", label: "Kanban" },
  { id: "gantt", label: "Gantt" },
  { id: "lista", label: "Lista" },
  { id: "calendario", label: "Calendário" },
] as const;

// Quadro de tarefas do projeto (Kanban/Gantt/Lista/Calendário), usado tanto
// na aba Tarefas do projeto quanto na Área do cliente. `baseHref` é a página
// que hospeda o quadro — os links de visão e de mês são montados a partir dela.
export async function TarefasView({
  obraId,
  view,
  ano,
  mes,
  baseHref,
}: {
  obraId: string;
  view: string;
  ano: number;
  mes: number;
  baseHref: string;
}) {
  const empresaAtivaId = await getEmpresaAtivaId();
  const sep = baseHref.includes("?") ? "&" : "?";

  const [tarefas, eventos, obraUf] = await Promise.all([
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
    prisma.obra.findUnique({ where: { id: obraId }, select: { ufCalendario: true } }),
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
            href={`${baseHref}${sep}view=${v.id}`}
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
        <CalendarioView
          obraId={obraId}
          ano={ano}
          mes={mes}
          eventos={eventos}
          tarefas={tarefas}
          uf={obraUf?.ufCalendario ?? null}
          mesHref={(a, m) => `${baseHref}${sep}view=calendario&ano=${a}&mes=${m}`}
        />
      )}
    </div>
  );
}
