import type { Metadata } from "next";
import { VistoriaForm } from "../vistoria-form";

export const metadata: Metadata = {
  title: "Novo relatório de vistoria — Gestão de Obra",
};

export default async function NovaVistoriaPage({
  params,
}: PageProps<"/obras/[obraId]/vistoria/novo">) {
  const { obraId } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Novo relatório de vistoria
        </h2>
      </div>
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
        <VistoriaForm obraId={obraId} />
      </div>
    </div>
  );
}
