import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { BackLink } from "@/components/back-link";
import { TarefaForm } from "../tarefa-form";

export const metadata: Metadata = {
  title: "Nova tarefa — Gestão de Obra",
};

export default async function NovaTarefaPage({
  params,
}: PageProps<"/projetos/[obraId]/tarefas/nova">) {
  const { obraId } = await params;
  const empresaAtivaId = await getEmpresaAtivaId();

  const [usuarios, tarefas] = await Promise.all([
    prisma.usuario.findMany({
      where: { empresaId: empresaAtivaId ?? undefined, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.tarefa.findMany({
      where: { obraId },
      select: { id: true, titulo: true },
      orderBy: { criadoEm: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={`/projetos/${obraId}/tarefas`} label="Tarefas" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Nova tarefa</h2>
      </div>
      <div className="max-w-2xl card p-6">
        <TarefaForm obraId={obraId} usuarios={usuarios} outrasTarefas={tarefas} />
      </div>
    </div>
  );
}
