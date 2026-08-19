import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ColaboradorForm } from "../../colaborador-form";

export const metadata: Metadata = {
  title: "Editar colaborador — Gestão de Obra",
};

export default async function EditarColaboradorPage({
  params,
}: PageProps<"/colaboradores/[colaboradorId]/editar">) {
  const { colaboradorId } = await params;

  const colaborador = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
  });

  if (!colaborador) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/colaboradores" label="Colaboradores" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Editar colaborador
        </h1>
      </div>
      <div className="max-w-lg card p-6">
        <ColaboradorForm colaborador={colaborador} />
      </div>
    </div>
  );
}
