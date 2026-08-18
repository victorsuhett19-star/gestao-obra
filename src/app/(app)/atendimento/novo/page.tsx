import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { AtendimentoForm } from "../atendimento-form";

export const metadata: Metadata = {
  title: "Novo atendimento — Gestão de Obra",
};

export default async function NovoAtendimentoPage() {
  const empresaAtivaId = await getEmpresaAtivaId();
  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: empresaAtivaId ?? undefined, ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Novo atendimento</h1>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <AtendimentoForm usuarios={usuarios} />
      </div>
    </div>
  );
}
