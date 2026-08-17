import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default async function ObraOverviewPage({
  params,
}: PageProps<"/obras/[obraId]">) {
  const { obraId } = await params;

  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra) {
    notFound();
  }

  const campos = [
    { label: "Cliente", valor: obra.clienteNome ?? "—" },
    { label: "Contato do cliente", valor: obra.clienteContato ?? "—" },
    { label: "Endereço", valor: obra.endereco ?? "—" },
    { label: "Início previsto", valor: formatDate(obra.dataInicioPrevista) },
    { label: "Fim previsto", valor: formatDate(obra.dataFimPrevista) },
    { label: "Início real", valor: formatDate(obra.dataInicioReal) },
    { label: "Fim real", valor: formatDate(obra.dataFimReal) },
    { label: "Cadastrada em", valor: formatDate(obra.criadoEm) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
      {campos.map((campo) => (
        <div key={campo.label}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {campo.label}
          </p>
          <p className="mt-0.5 text-sm text-slate-900">{campo.valor}</p>
        </div>
      ))}
    </div>
  );
}
