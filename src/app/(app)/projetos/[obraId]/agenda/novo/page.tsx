import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { EventoForm } from "@/app/(app)/agenda/evento-form";

export const metadata: Metadata = {
  title: "Novo evento — Gestão de Obra",
};

export default async function NovoEventoProjetoPage({
  params,
}: PageProps<"/projetos/[obraId]/agenda/novo">) {
  const { obraId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={`/projetos/${obraId}/agenda`} label="Agenda" />
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Novo evento</h2>
      </div>
      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
        <EventoForm
          obras={[]}
          obraIdFixo={obraId}
          voltarPara={`/projetos/${obraId}/agenda`}
        />
      </div>
    </div>
  );
}
