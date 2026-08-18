import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate as formatDateTimestamp, formatDateOnly } from "@/lib/labels";

// dataInicio/FimPrevista/Real vêm de <input type="date"> (dia puro, sem
// hora) — precisam ser lidas em UTC para não recuar um dia no fuso local.
function formatDate(date: Date | null) {
  if (!date) return "—";
  return formatDateOnly(date);
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
    { label: "CPF/CNPJ do cliente", valor: obra.clienteCpfCnpj ?? "—" },
    { label: "Telefone do cliente", valor: obra.clienteTelefone ?? "—" },
    { label: "E-mail do cliente", valor: obra.clienteEmail ?? "—" },
    { label: "Endereço", valor: obra.endereco ?? "—" },
    {
      label: "Condições de pagamento",
      valor: obra.condicoesPagamento ?? "—",
    },
    {
      label: "Prazo de execução",
      valor: obra.prazoExecucaoDias ? `${obra.prazoExecucaoDias} dias` : "—",
    },
    { label: "Início previsto", valor: formatDate(obra.dataInicioPrevista) },
    { label: "Fim previsto", valor: formatDate(obra.dataFimPrevista) },
    { label: "Início real", valor: formatDate(obra.dataInicioReal) },
    { label: "Fim real", valor: formatDate(obra.dataFimReal) },
    { label: "Cadastrada em", valor: formatDateTimestamp(obra.criadoEm) },
  ];

  return (
    <div className="flex flex-col gap-4">
      {obra.descricao && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Descrição do serviço
          </p>
          <p className="mt-0.5 text-sm text-slate-900">{obra.descricao}</p>
        </div>
      )}
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
    </div>
  );
}
