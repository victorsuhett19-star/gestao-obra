import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyClientSession, getCliente } from "@/lib/client-dal";
import { STATUS_ETAPA_PROJETO_LABEL, formatDateOnly } from "@/lib/labels";
import { uploadAnexoCliente, adicionarComentarioCliente } from "@/app/actions/cliente";
import { BackLink } from "@/components/back-link";
import { ComentariosObra } from "@/components/comentarios-obra";
import { PortalHeader } from "../../portal-header";
import { SignatureSection } from "./signature-section";

export const metadata: Metadata = {
  title: "Meu projeto — Portal do cliente",
};

export default async function PortalObraPage({
  params,
}: PageProps<"/portal/obras/[obraId]">) {
  await verifyClientSession();
  const cliente = await getCliente();
  if (!cliente) return null;

  const { obraId } = await params;

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      etapasProjeto: { orderBy: { ordem: "asc" } },
      anexos: {
        orderBy: { criadoEm: "desc" },
        include: { arquivo: true, enviadoPorUsuario: true, enviadoPorCliente: true },
      },
      comentarios: {
        orderBy: { criadoEm: "desc" },
        include: { autorUsuario: true, autorCliente: true },
      },
    },
  });

  if (!obra || obra.clienteAcessoId !== cliente.id) {
    notFound();
  }

  const total = obra.etapasProjeto.length;
  const concluidas = obra.etapasProjeto.filter((e) => e.status === "CONCLUIDA").length;
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const etapasComGrupo = obra.etapasProjeto.reduce<
    { etapa: (typeof obra.etapasProjeto)[number]; mostrarGrupo: boolean }[]
  >((acc, etapa) => {
    const grupoAnterior = acc.length > 0 ? acc[acc.length - 1].etapa.grupo : null;
    acc.push({ etapa, mostrarGrupo: !!etapa.grupo && etapa.grupo !== grupoAnterior });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <PortalHeader nome={cliente.nome} />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
        <div>
          <BackLink href="/portal" label="Meus projetos" />
          <p className="mt-1 text-xs font-medium text-slate-500">{obra.nome}</p>
          <h1 className="text-lg font-semibold text-slate-900">
            Acompanhamento do projeto
          </h1>
          {total > 0 && (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-orange-500"
                  style={{ width: `${percentual}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {concluidas} de {total} · {percentual}%
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          {total === 0 ? (
            <p className="text-sm text-slate-500">
              O fluxo do seu projeto ainda não foi iniciado pela nossa equipe.
            </p>
          ) : (
            <ol className="flex flex-col">
              {etapasComGrupo.map(({ etapa, mostrarGrupo }, i) => {
                return (
                  <li key={etapa.id}>
                    {mostrarGrupo && (
                      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-orange-600 first:mt-0">
                        {etapa.grupo}
                      </p>
                    )}
                    <div className="flex gap-3 pb-6 last:pb-0">
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
                        {etapa.status === "EM_ANDAMENTO" && (
                          <div className="mt-3 max-w-sm">
                            <SignatureSection
                              obraId={obra.id}
                              etapaId={etapa.id}
                              assinado={!!etapa.assinadoClienteEm}
                              assinaturaUrl={
                                etapa.assinaturaClienteId
                                  ? `/api/arquivos/${etapa.assinaturaClienteId}`
                                  : null
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-surface p-5">
          <p className="text-sm font-semibold text-slate-800">Anexos</p>
          <form
            action={uploadAnexoCliente.bind(null, obra.id)}
            className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              type="file"
              name="arquivo"
              required
              className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
            />
            <button
              type="submit"
              className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
            >
              Anexar
            </button>
          </form>
          <div className="mt-4 flex flex-col gap-2">
            {obra.anexos.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum anexo registrado ainda.</p>
            ) : (
              obra.anexos.map((a) => (
                <a
                  key={a.id}
                  href={`/api/arquivos/${a.arquivoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <span className="text-slate-700">
                    {a.arquivo.nomeOriginal}
                    {a.descricao && (
                      <span className="text-slate-400"> — {a.descricao}</span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">
                    {a.enviadoPorCliente ? "Você" : a.enviadoPorUsuario?.nome ?? "Equipe"}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>

        <ComentariosObra
          comentarios={obra.comentarios}
          onAdicionar={adicionarComentarioCliente.bind(null, obra.id)}
          autorAtualEhCliente
        />
      </div>
    </div>
  );
}
