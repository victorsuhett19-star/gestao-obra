import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { BackLink } from "@/components/back-link";
import { ContaForm } from "../conta-form";

export const metadata: Metadata = {
  title: "Nova conta — Gestão de Obra",
};

export default async function NovaContaPage() {
  const empresaAtivaId = await getEmpresaAtivaId();

  const [fornecedores, obras] = await Promise.all([
    prisma.fornecedor.findMany({
      where: { empresaId: empresaAtivaId ?? undefined },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.obra.findMany({
      where: { empresaId: empresaAtivaId ?? undefined },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/financeiro" label="Financeiro" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Nova conta</h1>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <ContaForm fornecedores={fornecedores} obras={obras} />
      </div>
    </div>
  );
}
