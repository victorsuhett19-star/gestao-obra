import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { STATUS_ETAPA_PROJETO_LABEL, formatDateOnly } from "@/lib/labels";
import {
  gerarFluxoObra,
  avancarEtapa,
  salvarDataEtapa,
  excluirAnexo,
} from "@/app/actions/projetos";
import { removerAcessoCliente } from "@/app/actions/cliente";
import { AnexoUploadForm } from "./anexo-upload-form";
import { ClienteAcessoForm } from "@/components/cliente-acesso-form";

export const metadata: Metadata = {
  title: "Projeto — Gestão de Obra",
};

export default async function ProjetoDetalhePage({
  params,
}: PageProps<"/projetos/[obraId]">) {
  const { obraId } = await params;
  const user = await getUser();
  const isAdmin = user?.papel === "ADMIN" || user?.papel === "GESTOR";

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      trades: true,
      clienteAcesso: true,
      etapasProjeto: {
        orderBy: { ordem: "asc" },
        include: { assinaturaCliente: true },
      },
      anexos: {
        orderBy: { criadoEm: "desc" },
        include: { arquivo: true, enviadoPorUsuario: true, enviadoPorCliente: true },
      },
    },
  });
  if (!obra) notFound();

  const total = obra.etapasProjeto.length;
  const concluidas = obra.etapasProjeto.filter((e) => e.status === "CONCLUIDA").length;
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  const etapaAtualIndex = obra.etapasProjeto.findIndex((e) => e.status === "EM_ANDAMENTO");

  const etapasComGrupo = obra.etapasProjeto.reduce<
    { etapa: (typeof obra.etapasProjeto)[number]; mostrarGrupo: boolean }[]
  >((acc, etapa) => {
    const grupoAnterior = acc.length > 0 ? acc[acc.length - 1].etapa.grupo : null;
    acc.push({ etapa, mostrarGrupo: !!etapa.grupo && etapa.grupo !== grupoAnterior });
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Fluxo de entrega
            </p>
            {total > 0 && (
              <span className="text-xs text-slate-500">
                {concluidas} de {total} · {percentual}%
              </span>
            )}
          </div>

          {total === 0 ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">
                Este projeto ainda não tem um fluxo de etapas.
              </p>
              <form action={gerarFluxoObra.bind(null, obra.id)} className="mt-3">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Gerar fluxo a partir do template da especialidade
                </button>
              </form>
              {obra.trades.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  Marque ao menos uma especialidade na obra antes de gerar o fluxo.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${percentual}%` }}
                />
              </div>

              <ol className="mt-5 flex flex-col">
                {etapasComGrupo.map(({ etapa, mostrarGrupo }, i) => {
                  const ehAtual = i === etapaAtualIndex;
                  return (
                    <li key={etapa.id}>
                      {mostrarGrupo && (
                        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-orange-600 first:mt-0">
                          {etapa.grupo}
                        </p>
                      )}
                      <div className="flex gap-3 pb-5 last:pb-0">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                              etapa.status === "CONCLUIDA"
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : etapa.status === "EM_ANDAMENTO"
                                  ? "border-orange-500 text-orange-600"
                                  : "border-slate-300 text-slate-400"
                            }`}
                          >
                            {etapa.status === "CONCLUIDA" ? "✓" : i + 1}
                          </span>
                          {i < obra.etapasProjeto.length - 1 && (
                            <span className="mt-1 w-px flex-1 bg-slate-200" />
                          )}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p
                            className={`text-sm font-medium ${etapa.status === "AGUARDANDO" ? "text-slate-400" : "text-slate-900"}`}
                          >
                            {etapa.nome}
                          </p>
                          <p className="text-xs text-slate-500">
                            {STATUS_ETAPA_PROJETO_LABEL[etapa.status]}
                            {etapa.data && ` · ${formatDateOnly(etapa.data)}`}
                          </p>
                          {etapa.assinadoClienteEm && (
                            <p className="mt-1 text-xs text-emerald-600">
                              ✓ Cliente assinou em {formatDateOnly(etapa.assinadoClienteEm)}
                            </p>
                          )}

                          {ehAtual && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <form action={avancarEtapa.bind(null, obra.id, etapa.id)}>
                                <button
                                  type="submit"
                                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
                                >
                                  Avançar →
                                </button>
                              </form>
                              <form
                                action={salvarDataEtapa.bind(null, obra.id, etapa.id)}
                                className="flex items-center gap-1.5"
                              >
                                <input
                                  type="date"
                                  name="data"
                                  defaultValue={
                                    etapa.data
                                      ? etapa.data.toISOString().slice(0, 10)
                                      : ""
                                  }
                                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-500"
                                />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                                >
                                  Salvar data
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-800">
              Histórico de anexos
            </p>
            <AnexoUploadForm obraId={obra.id} />
            <div className="mt-3 flex flex-col gap-2">
              {obra.anexos.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhum anexo registrado ainda.
                </p>
              ) : (
                obra.anexos.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <a
                      href={`/api/arquivos/${a.arquivoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate text-slate-700 hover:underline"
                    >
                      {a.arquivo.nomeOriginal}
                    </a>
                    <span className="shrink-0 text-xs text-slate-400">
                      {a.enviadoPorCliente
                        ? `${a.enviadoPorCliente.nome} (cliente)`
                        : (a.enviadoPorUsuario?.nome ?? "Equipe")}
                    </span>
                    <form action={excluirAnexo.bind(null, a.id, obra.id)}>
                      <button
                        type="submit"
                        className="shrink-0 text-xs font-medium text-red-500 hover:underline"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
