import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { BackLink } from "@/components/back-link";
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
        <BackLink href="/agenda" label="Agenda" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Novo evento</h1>
      </div>
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-surface p-6">
        <EventoForm obras={obras} />
      </div>
    </div>
  );
}
