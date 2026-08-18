import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { EventoForm } from "../evento-form";

export const metadata: Metadata = {
  title: "Novo evento — Gestão de Obra",
};

export default async function NovoEventoPage() {
  const empresaAtivaId = await getEmpresaAtivaId();
  const obras = await prisma.obra.findMany({
    where: { empresaId: empresaAtivaId ?? undefined },
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Novo evento</h1>
      </div>
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
        <EventoForm obras={obras} />
      </div>
    </div>
  );
}
