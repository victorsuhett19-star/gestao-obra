import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { MaterialForm } from "../../material-form";

export const metadata: Metadata = {
  title: "Editar material — Gestão de Obra",
};

export default async function EditarMaterialPage({
  params,
}: PageProps<"/materiais/[materialId]/editar">) {
  const { materialId } = await params;

  const material = await prisma.material.findUnique({
    where: { id: materialId },
  });

  if (!material) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/materiais" label="Materiais" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Editar material
        </h1>
      </div>
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-surface p-6">
        <MaterialForm material={material} />
      </div>
    </div>
  );
}
