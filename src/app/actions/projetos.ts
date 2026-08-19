"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import { salvarArquivo } from "@/lib/uploads";

/** Cria as etapas do pipeline de uma obra a partir do(s) template(s) da(s)
 * especialidade(s) marcada(s). Não faz nada se a obra já tiver etapas. */
export async function gerarFluxoObra(obraId: string) {
  await verifySession();

  const existentes = await prisma.etapaProjeto.count({ where: { obraId } });
  if (existentes > 0) return;

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: { trades: true },
  });
  if (!obra) return;

  const trades = obra.trades.map((t) => t.trade);
  if (trades.length === 0) return;

  let etapas: { nome: string; grupo: string | null; ordem: number }[] = [];

  if (trades.length === 1) {
    const templates = await prisma.etapaProjetoTemplate.findMany({
      where: { empresaId: obra.empresaId, trade: trades[0] },
      orderBy: { ordem: "asc" },
    });
    etapas = templates.map((t, i) => ({ nome: t.nome, grupo: t.grupo, ordem: i }));
  } else {
    // Obra turn-key (várias especialidades): concatena os templates de cada
    // uma, agrupando visualmente pelo nome da especialidade.
    const { TRADE_LABEL } = await import("@/lib/labels");
    let ordem = 0;
    for (const trade of trades) {
      const templates = await prisma.etapaProjetoTemplate.findMany({
        where: { empresaId: obra.empresaId, trade },
        orderBy: { ordem: "asc" },
      });
      for (const t of templates) {
        etapas.push({ nome: t.nome, grupo: t.grupo ?? TRADE_LABEL[trade], ordem: ordem++ });
      }
    }
  }

  if (etapas.length === 0) return;

  await prisma.$transaction(
    etapas.map((e, i) =>
      prisma.etapaProjeto.create({
        data: {
          obraId,
          nome: e.nome,
          grupo: e.grupo,
          ordem: e.ordem,
          status: i === 0 ? "EM_ANDAMENTO" : "AGUARDANDO",
        },
      })
    )
  );

  revalidatePath(`/projetos/${obraId}`);
}

export async function avancarEtapa(obraId: string, etapaProjetoId: string) {
  await verifySession();

  const atual = await prisma.etapaProjeto.findUnique({ where: { id: etapaProjetoId } });
  if (!atual || atual.obraId !== obraId || atual.status !== "EM_ANDAMENTO") return;

  const proxima = await prisma.etapaProjeto.findFirst({
    where: { obraId, ordem: { gt: atual.ordem } },
    orderBy: { ordem: "asc" },
  });

  await prisma.$transaction([
    prisma.etapaProjeto.update({
      where: { id: atual.id },
      data: { status: "CONCLUIDA", concluidaEm: new Date() },
    }),
    ...(proxima
      ? [
          prisma.etapaProjeto.update({
            where: { id: proxima.id },
            data: { status: "EM_ANDAMENTO" },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/projetos/${obraId}`);
}

export async function salvarDataEtapa(
  obraId: string,
  etapaProjetoId: string,
  formData: FormData
) {
  await verifySession();

  const data = formData.get("data");
  if (typeof data !== "string" || !data) return;

  await prisma.etapaProjeto.update({
    where: { id: etapaProjetoId },
    data: { data: new Date(data) },
  });

  revalidatePath(`/projetos/${obraId}`);
}

export async function uploadAnexo(obraId: string, formData: FormData) {
  const user = await verifySession().then(() => getUser());
  if (!user) return;

  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) return;

  const descricao = formData.get("descricao");

  const url = await salvarArquivo(arquivo, user.empresaId);
  const arquivoId = url.replace("/api/arquivos/", "");

  await prisma.anexoObra.create({
    data: {
      obraId,
      arquivoId,
      descricao: typeof descricao === "string" && descricao ? descricao : null,
      enviadoPorUsuarioId: user.id,
    },
  });

  revalidatePath(`/projetos/${obraId}`);
}

export async function excluirAnexo(anexoId: string, obraId: string) {
  await verifySession();
  await prisma.anexoObra.delete({ where: { id: anexoId } });
  revalidatePath(`/projetos/${obraId}`);
}

/** Cliente fechou a obra completa (turn-key): adiciona a especialidade OBRA
 * ao projeto, sem tirar as que já existem — assim ele passa a contar como
 * turn-key nos relatórios financeiros e aparece com o toolset completo de
 * Obras (materiais, montagem, conferência, vistoria) além dos tópicos de
 * Projetos. Não duplica se já tiver a especialidade. */
export async function marcarTurnkey(obraId: string) {
  await verifySession();

  const jaTem = await prisma.obraTrade.findUnique({
    where: { obraId_trade: { obraId, trade: "OBRA" } },
  });
  if (jaTem) return;

  await prisma.obraTrade.create({ data: { obraId, trade: "OBRA" } });

  revalidatePath(`/projetos/${obraId}`);
  revalidatePath(`/obras/${obraId}`);
  revalidatePath("/projetos");
  revalidatePath("/obras");
  revalidatePath("/financeiro/dashboard");
}

/** Cliente decidiu fazer mais algum tipo de item com a gente — adiciona
 * outra(s) especialidade(s) ao projeto que já existe, sem tirar as que já
 * tinha. Ele passa a aparecer também na aba/workspace daquela especialidade. */
export async function adicionarEspecialidade(obraId: string, formData: FormData) {
  await verifySession();

  const trades = formData.getAll("trades") as string[];
  if (trades.length === 0) return;

  await prisma.$transaction(
    trades.map((trade) =>
      prisma.obraTrade.upsert({
        where: { obraId_trade: { obraId, trade: trade as never } },
        update: {},
        create: { obraId, trade: trade as never },
      })
    )
  );

  revalidatePath(`/projetos/${obraId}`);
  revalidatePath(`/obras/${obraId}`);
  revalidatePath("/projetos");
  revalidatePath("/obras");
  revalidatePath("/financeiro/dashboard");
}

/** Anotações internas da equipe sobre a obra/projeto — não aparece no portal
 * do cliente, só nas abas internas (Obras e Projetos). */
export async function adicionarNota(obraId: string, formData: FormData) {
  const user = await verifySession().then(() => getUser());
  if (!user) return;

  const texto = formData.get("texto");
  if (typeof texto !== "string" || !texto.trim()) return;

  await prisma.notaObra.create({
    data: {
      obraId,
      texto: texto.trim(),
      criadoPorId: user.id,
    },
  });

  revalidatePath(`/projetos/${obraId}`);
  revalidatePath(`/obras/${obraId}`);
}

export async function excluirNota(notaId: string, obraId: string) {
  await verifySession();
  await prisma.notaObra.delete({ where: { id: notaId } });
  revalidatePath(`/projetos/${obraId}`);
  revalidatePath(`/obras/${obraId}`);
}
