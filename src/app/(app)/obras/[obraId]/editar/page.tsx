import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ObraForm } from "../../obra-form";

export const metadata: Metadata = {
  title: "Editar obra — Gestão de Obra",
};

export default async function EditarObraPage({
  params,
}: PageProps<"/obras/[obraId]/editar">) {
  const { obraId } = await params;

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: { trades: true },
  });

  if (!obra) {
    notFound();
  }

  return (
    <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
      <ObraForm
        obra={{
          id: obra.id,
          nome: obra.nome,
          endereco: obra.endereco,
          clienteNome: obra.clienteNome,
          clienteContato: obra.clienteContato,
          status: obra.status,
          dataInicioPrevista: obra.dataInicioPrevista,
          dataFimPrevista: obra.dataFimPrevista,
          trades: obra.trades.map((t) => t.trade),
        }}
      />
    </div>
  );
}
