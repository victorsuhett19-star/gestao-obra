import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
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
        <h1 className="text-xl font-semibold text-slate-900">
          Editar material
        </h1>
      </div>
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <MaterialForm material={material} />
      </div>
    </div>
  );
}
