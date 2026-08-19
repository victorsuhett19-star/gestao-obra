import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { BackLink } from "@/components/back-link";
import { excluirTarefa } from "@/app/actions/tarefas";
import { TarefaForm } from "../../tarefa-form";

export const metadata: Metadata = {
  title: "Editar tarefa — Gestão de Obra",
};

export default async function EditarTarefaPage({
  params,
}: PageProps<"/projetos/[obraId]/tarefas/[tarefaId]/editar">) {
  const { obraId, tarefaId } = await params;
  const empresaAtivaId = await getEmpresaAtivaId();

  const [tarefa, usuarios, outrasTarefas] = await Promise.all([
    prisma.tarefa.findUnique({
      where: { id: tarefaId },
      include: { dependeDe: true },
    }),
    prisma.usuario.findMany({
      where: { empresaId: empresaAtivaId ?? undefined, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.tarefa.findMany({
      where: { obraId, id: { not: tarefaId } },
      select: { id: true, titulo: true },
      orderBy: { criadoEm: "asc" },
    }),
  ]);

  if (!tarefa) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <BackLink href={`/projetos/${obraId}/tarefas`} label="Tarefas" />
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Editar tarefa</h2>
        </div>
        <form action={excluirTarefa.bind(null, tarefa.id, obraId)}>
          <button type="submit" className="text-sm font-medium text-red-500 hover:underline">
            Excluir tarefa
          </button>
        </form>
      </div>
      <div className="max-w-2xl card p-6">
        <TarefaForm
          obraId={obraId}
          usuarios={usuarios}
          outrasTarefas={outrasTarefas}
          tarefa={tarefa}
        />
      </div>
    </div>
  );
}
