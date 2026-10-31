"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { podeVerModulo } from "@/lib/modulos";
import { parseValorBR } from "@/lib/labels";
import { ESTADOS } from "@/lib/feriados-uf";

async function exigirAcesso() {
  const user = await getUser();
  if (!podeVerModulo(user, "areacliente")) {
    throw new Error("Você não tem acesso à Área do cliente.");
  }
}

export async function adicionarLancamentoCliente(obraId: string, formData: FormData) {
  await exigirAcesso();

  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const valor = parseValorBR(String(formData.get("valor") ?? ""));
  const dataStr = String(formData.get("data") ?? "");
  if (!descricao || Number.isNaN(valor) || valor <= 0) return;

  await prisma.lancamentoCliente.create({
    data: {
      obraId,
      tipo: "CUSTO",
      descricao,
      categoria: categoria || null,
      valor,
      data: dataStr ? new Date(dataStr) : new Date(),
    },
  });

  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/area-cliente");
  revalidatePath("/portal");
}

export async function excluirLancamentoCliente(obraId: string, lancamentoId: string) {
  await exigirAcesso();
  await prisma.lancamentoCliente.delete({ where: { id: lancamentoId, obraId } });
  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/area-cliente");
  revalidatePath("/portal");
}

export async function editarLancamentoCliente(
  obraId: string,
  lancamentoId: string,
  formData: FormData
) {
  await exigirAcesso();

  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const valor = parseValorBR(String(formData.get("valor") ?? ""));
  const dataStr = String(formData.get("data") ?? "");
  if (descricao && !Number.isNaN(valor) && valor > 0) {
    await prisma.lancamentoCliente.update({
      where: { id: lancamentoId, obraId },
      data: {
        descricao,
        categoria: categoria || null,
        valor,
        ...(dataStr ? { data: new Date(dataStr) } : {}),
      },
    });
  }

  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/area-cliente");
  revalidatePath("/portal");
  redirect(`/area-cliente/${obraId}`);
}

/** Liga/desliga a exibição do financeiro no portal do cliente. */
export async function alternarFinanceiroPortal(obraId: string) {
  await exigirAcesso();
  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    select: { financeiroPortalVisivel: true },
  });
  if (!obra) return;
  await prisma.obra.update({
    where: { id: obraId },
    data: { financeiroPortalVisivel: !obra.financeiroPortalVisivel },
  });
  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/portal");
}

/** Guarda a UF do projeto, usada pra mostrar feriados estaduais no calendário. */
export async function salvarUfCalendario(obraId: string, formData: FormData) {
  await exigirAcesso();
  const uf = String(formData.get("uf") ?? "");
  await prisma.obra.update({
    where: { id: obraId },
    data: { ufCalendario: uf && uf in ESTADOS ? uf : null },
  });
  revalidatePath(`/area-cliente/${obraId}`);
}

// --- Notas (cliente ↔ equipe) ---

function revalidarNotas(obraId: string) {
  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath(`/portal/obras/${obraId}`);
}

export async function adicionarNotaEquipe(obraId: string, formData: FormData) {
  await exigirAcesso();
  const user = await getUser();
  const texto = String(formData.get("texto") ?? "").trim();
  if (!user || !texto) return;
  await prisma.notaCliente.create({
    data: { obraId, texto, autorUsuarioId: user.id },
  });
  revalidarNotas(obraId);
}

export async function alternarNotaResolvida(obraId: string, notaId: string) {
  await exigirAcesso();
  const nota = await prisma.notaCliente.findFirst({ where: { id: notaId, obraId } });
  if (!nota) return;
  await prisma.notaCliente.update({
    where: { id: notaId },
    data: { resolvida: !nota.resolvida },
  });
  revalidarNotas(obraId);
}

export async function excluirNotaCliente(obraId: string, notaId: string) {
  await exigirAcesso();
  await prisma.notaCliente.delete({ where: { id: notaId, obraId } });
  revalidarNotas(obraId);
}

// --- Cronograma de obra (editável) ---

function revalidarCronograma(obraId: string) {
  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath(`/area-cliente/${obraId}/apresentar`);
  revalidatePath(`/portal/obras/${obraId}`);
}

function lerItemCronograma(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const grupo = String(formData.get("grupo") ?? "").trim() || null;
  const responsavel = String(formData.get("responsavel") ?? "").trim() || null;
  const ini = String(formData.get("dataInicio") ?? "");
  const fim = String(formData.get("dataFim") ?? "");
  const progresso = Math.min(100, Math.max(0, Math.round(Number(formData.get("progresso") ?? 0)) || 0));
  if (!nome || !ini || !fim) return null;
  let dataInicio = new Date(ini);
  let dataFim = new Date(fim);
  if (dataFim < dataInicio) [dataInicio, dataFim] = [dataFim, dataInicio];
  return { nome, grupo, responsavel, dataInicio, dataFim, progresso };
}

export async function adicionarItemCronograma(obraId: string, formData: FormData) {
  await exigirAcesso();
  const item = lerItemCronograma(formData);
  if (!item) return;
  const ultimo = await prisma.cronogramaItem.aggregate({ where: { obraId }, _max: { ordem: true } });
  await prisma.cronogramaItem.create({
    data: { obraId, ...item, ordem: (ultimo._max.ordem ?? -1) + 1 },
  });
  revalidarCronograma(obraId);
}

export async function salvarItemCronograma(obraId: string, itemId: string, formData: FormData) {
  await exigirAcesso();
  const item = lerItemCronograma(formData);
  if (!item) return;
  await prisma.cronogramaItem.update({ where: { id: itemId, obraId }, data: item });
  revalidarCronograma(obraId);
}

export async function excluirItemCronograma(obraId: string, itemId: string) {
  await exigirAcesso();
  await prisma.cronogramaItem.delete({ where: { id: itemId, obraId } });
  revalidarCronograma(obraId);
}

/** Monta o cronograma inicial a partir das especialidades que já têm datas. */
export async function gerarCronogramaDasEspecialidades(obraId: string) {
  await exigirAcesso();
  const existentes = await prisma.cronogramaItem.count({ where: { obraId } });
  if (existentes > 0) return;
  const { TRADE_LABEL } = await import("@/lib/labels");
  const trades = await prisma.obraTrade.findMany({ where: { obraId } });
  const comDatas = trades
    .filter((t) => t.dataInicio && t.dataFim)
    .sort((a, b) => (a.dataInicio as Date).getTime() - (b.dataInicio as Date).getTime());
  if (comDatas.length === 0) return;
  await prisma.cronogramaItem.createMany({
    data: comDatas.map((t, i) => ({
      obraId,
      nome: TRADE_LABEL[t.trade] ?? t.trade,
      dataInicio: t.dataInicio as Date,
      dataFim: t.dataFim as Date,
      ordem: i,
    })),
  });
  revalidarCronograma(obraId);
}
