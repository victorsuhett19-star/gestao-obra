import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ItemConferenciaForm } from "../item-conferencia-form";

export const metadata: Metadata = {
  title: "Novo item de conferência — Gestão de Obra",
};

export default async function NovoItemConferenciaPage({
  params,
}: PageProps<"/obras/[obraId]/conferencia/novo">) {
  const { obraId } = await params;

  const usuarios = await prisma.usuario.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Novo item de conferência
        </h2>
      </div>
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
        <ItemConferenciaForm obraId={obraId} usuarios={usuarios} />
      </div>
    </div>
  );
}
