import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { BackLink } from "@/components/back-link";
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
        <BackLink href={`/obras/${obraId}/diario`} label="Diário de obra" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Novo registro de diário
        </h2>
      </div>
      <div className="max-w-2xl card p-6">
        <DiarioForm obraId={obraId} colaboradores={colaboradores} />
      </div>
    </div>
  );
}
