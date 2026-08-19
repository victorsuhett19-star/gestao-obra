import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { AtendimentoKanban } from "./atendimento-kanban";

export const metadata: Metadata = {
  title: "Atendimento — Gestão de Obra",
};

export default async function AtendimentoPage() {
  const empresaAtivaId = await getEmpresaAtivaId();
  const atendimentos = await prisma.atendimento.findMany({
    where: { empresaId: empresaAtivaId ?? undefined },
    include: {
      vendedor: { select: { nome: true } },
      vendedorColaborador: { select: { nome: true } },
      especialidades: true,
    },
    orderBy: { criadoEm: "asc" },
  });

  const perdidos = atendimentos.filter((a) => a.status === "PERDIDO");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Atendimento</h1>
          <p className="text-sm text-slate-500">
            Funil de vendas — {atendimentos.length} atendimento(s), {perdidos.length} perdido(s).
            Arraste o card ou use o seletor de etapa dentro dele pra mudar
            direto pra qualquer coluna.
          </p>
        </div>
        <Link
          href="/atendimento/novo"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          + Novo atendimento
        </Link>
      </div>

      <AtendimentoKanban atendimentos={atendimentos} />
    </div>
  );
}
