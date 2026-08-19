import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { formatDate as formatDateTimestamp, formatDateOnly } from "@/lib/labels";
import { ClienteAcessoForm } from "@/components/cliente-acesso-form";
import { removerAcessoCliente } from "@/app/actions/cliente";
import { NotasObra } from "@/components/notas-obra";
import { ComentariosObra } from "@/components/comentarios-obra";
import { adicionarComentario, excluirComentario } from "@/app/actions/projetos";

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
  const user = await getUser();
  const isAdmin = user?.papel === "ADMIN" || user?.papel === "GESTOR";

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      clienteAcesso: true,
      notas: { orderBy: { criadoEm: "desc" }, include: { criadoPor: true } },
      comentarios: {
        orderBy: { criadoEm: "desc" },
        include: { autorUsuario: true, autorCliente: true },
      },
    },
  });
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
      <div className="flex justify-end">
        <a
          href={`/api/obras/${obra.id}/relatorio`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          📄 Gerar relatório digital (PDF)
        </a>
      </div>
      {obra.descricao && (
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Descrição do serviço
          </p>
          <p className="mt-0.5 text-sm text-slate-900">{obra.descricao}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 card p-6 sm:grid-cols-2">
        {campos.map((campo) => (
          <div key={campo.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {campo.label}
            </p>
            <p className="mt-0.5 text-sm text-slate-900">{campo.valor}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <p className="text-sm font-semibold text-slate-800">
          Acesso do cliente ao portal
        </p>
        {obra.clienteAcesso ? (
          <div className="mt-2 text-sm text-slate-600">
            <p className="font-medium text-slate-800">{obra.clienteAcesso.nome}</p>
            <p className="text-xs text-slate-500">{obra.clienteAcesso.email}</p>
            <p className="mt-2 text-xs text-emerald-600">
              ✓ Cliente pode ver e assinar em /portal
            </p>
            {isAdmin && (
              <form action={removerAcessoCliente.bind(null, obra.id)} className="mt-2">
                <button
                  type="submit"
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Remover acesso
                </button>
              </form>
            )}
          </div>
        ) : isAdmin ? (
          <>
            <p className="mt-1 text-xs text-slate-500">
              Crie um login para o cliente acompanhar este projeto e assinar
              pelo portal.
            </p>
            <ClienteAcessoForm
              obraId={obra.id}
              nomeInicial={obra.clienteNome ?? ""}
              emailInicial={obra.clienteEmail ?? ""}
              telefoneInicial={obra.clienteTelefone ?? ""}
            />
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Nenhum acesso criado ainda.
          </p>
        )}
      </div>

      <ComentariosObra
        comentarios={obra.comentarios}
        onAdicionar={adicionarComentario.bind(null, obra.id)}
        criarAcaoExcluir={(comentarioId) =>
          excluirComentario.bind(null, comentarioId, obra.id)
        }
      />

      <NotasObra obraId={obra.id} notas={obra.notas} />
    </div>
  );
}
