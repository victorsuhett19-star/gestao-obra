import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { BackLink } from "@/components/back-link";
import { AtendimentoForm } from "../../atendimento-form";
import { marcarPerdido } from "@/app/actions/atendimento";

export const metadata: Metadata = {
  title: "Editar atendimento — Gestão de Obra",
};

export default async function EditarAtendimentoPage({
  params,
}: PageProps<"/atendimento/[atendimentoId]/editar">) {
  const { atendimentoId } = await params;

  const empresaAtivaId = await getEmpresaAtivaId();
  const [atendimento, usuarios] = await Promise.all([
    prisma.atendimento.findUnique({
      where: { id: atendimentoId },
      include: { especialidades: true },
    }),
    prisma.usuario.findMany({
      where: { empresaId: empresaAtivaId ?? undefined, ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!atendimento) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/atendimento" label="Atendimento" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Editar atendimento
        </h1>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <AtendimentoForm usuarios={usuarios} atendimento={atendimento} />
      </div>

      {atendimento.status !== "PERDIDO" && atendimento.status !== "GANHO" && (
        <div className="max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-800">Marcar como perdido</p>
          <form action={marcarPerdido.bind(null, atendimento.id)} className="mt-2 flex gap-2">
            <input
              name="motivo"
              placeholder="Motivo da perda"
              className="flex-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Marcar perdido
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
