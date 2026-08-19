import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { BackLink } from "@/components/back-link";
import { MontagemForm } from "../montagem-form";

export const metadata: Metadata = {
  title: "Nova montagem — Gestão de Obra",
};

export default async function NovaMontagemPage({
  params,
}: PageProps<"/obras/[obraId]/montagem/novo">) {
  const { obraId } = await params;
  const empresaAtivaId = await getEmpresaAtivaId();

  const montadores = await prisma.colaborador.findMany({
    where: { empresaId: empresaAtivaId ?? undefined, ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={`/obras/${obraId}/montagem`} label="Montagem" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Nova montagem</h2>
      </div>
      <div className="max-w-3xl card p-6">
        <MontagemForm obraId={obraId} montadores={montadores} />
      </div>
    </div>
  );
}
