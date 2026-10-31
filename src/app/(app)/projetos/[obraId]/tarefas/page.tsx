import type { Metadata } from "next";
import { TarefasView } from "@/components/tarefas-view";

export const metadata: Metadata = {
  title: "Tarefas — VS Gestão de Obra",
};

export default async function TarefasPage({
  params,
  searchParams,
}: PageProps<"/projetos/[obraId]/tarefas">) {
  const { obraId } = await params;
  const sp = await searchParams;
  const view = typeof sp.view === "string" ? sp.view : "kanban";
  const hoje = new Date();
  const ano = typeof sp.ano === "string" ? Number(sp.ano) : hoje.getUTCFullYear();
  const mes = typeof sp.mes === "string" ? Number(sp.mes) : hoje.getUTCMonth();

  return (
    <TarefasView
      obraId={obraId}
      view={view}
      ano={ano}
      mes={mes}
      baseHref={`/projetos/${obraId}/tarefas`}
    />
  );
}
