import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MontagemForm } from "../montagem-form";

export const metadata: Metadata = {
  title: "Nova montagem — Gestão de Obra",
};

export default async function NovaMontagemPage({
  params,
}: PageProps<"/obras/[obraId]/montagem/novo">) {
  const { obraId } = await params;

  const montadores = await prisma.colaborador.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Nova montagem</h2>
      </div>
      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <MontagemForm obraId={obraId} montadores={montadores} />
      </div>
    </div>
  );
}
