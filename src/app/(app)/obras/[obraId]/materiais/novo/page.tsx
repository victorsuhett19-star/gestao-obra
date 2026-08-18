import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PedidoForm } from "../pedido-form";

export const metadata: Metadata = {
  title: "Novo pedido de material — Gestão de Obra",
};

export default async function NovoPedidoPage({
  params,
}: PageProps<"/obras/[obraId]/materiais/novo">) {
  const { obraId } = await params;

  const [fornecedores, materiais] = await Promise.all([
    prisma.fornecedor.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.material.findMany({
      select: { id: true, nome: true, unidade: true, precoReferencia: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Novo pedido de material
        </h2>
        {(fornecedores.length === 0 || materiais.length === 0) && (
          <p className="mt-1 text-sm text-amber-600">
            {fornecedores.length === 0 && "Cadastre um fornecedor "}
            {fornecedores.length === 0 && materiais.length === 0 && "e "}
            {materiais.length === 0 && "cadastre um material "}
            antes de criar um pedido.
          </p>
        )}
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <PedidoForm obraId={obraId} fornecedores={fornecedores} materiais={materiais} />
      </div>
    </div>
  );
}
