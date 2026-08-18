import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { DiarioForm } from "../diario-form";

export const metadata: Metadata = {
  title: "Novo registro de diário — Gestão de Obra",
};

export default async function NovoDiarioPage({
  params,
}: PageProps<"/obras/[obraId]/diario/novo">) {
  const { obraId } = await params;
  const empresaAtivaId = await getEmpresaAtivaId();

  const colaboradores = await prisma.colaborador.findMany({
    where: { empresaId: empresaAtivaId ?? undefined, ativo: true },
    select: { id: true, nome: true, funcao: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Novo registro de diário
        </h2>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <DiarioForm obraId={obraId} colaboradores={colaboradores} />
      </div>
    </div>
  );
}
