import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { FornecedorForm } from "../../fornecedor-form";

export const metadata: Metadata = {
  title: "Editar fornecedor — Gestão de Obra",
};

export default async function EditarFornecedorPage({
  params,
}: PageProps<"/fornecedores/[fornecedorId]/editar">) {
  const { fornecedorId } = await params;

  const fornecedor = await prisma.fornecedor.findUnique({
    where: { id: fornecedorId },
  });

  if (!fornecedor) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/fornecedores" label="Fornecedores" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Editar fornecedor
        </h1>
      </div>
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
        <FornecedorForm fornecedor={fornecedor} />
      </div>
    </div>
  );
}
