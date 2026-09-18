"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";

// --- Tabela de preços (tipos de material) ---------------------------------

export async function salvarTipoMaterial(formData: FormData) {
  const user = await verifySession().then(() => getUser());
  if (!user) return;

  const id = formData.get("id");
  const nome = formData.get("nome");
  const valorM2 = formData.get("valorM2");
  const ferragem = formData.get("ferragemPercent");
  const complexidade = formData.get("complexidadePercent");
  if (typeof nome !== "string" || !nome.trim()) return;
  if (typeof valorM2 !== "string" || !valorM2) return;

  const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;

  const data = {
    nome: nome.trim(),
    valorM2: Number(valorM2.replace(",", ".")),
    ferragemPercent: typeof ferragem === "string" && ferragem ? Number(ferragem.replace(",", ".")) / 100 : 0,
    complexidadePercent:
      typeof complexidade === "string" && complexidade ? Number(complexidade.replace(",", ".")) / 100 : 0,
  };

  if (typeof id === "string" && id) {
    await prisma.tipoMaterialOrcamento.update({ where: { id }, data });
  } else {
    await prisma.tipoMaterialOrcamento.create({
      data: { ...data, empresaId: empresaAtivaId },
    });
  }

  revalidatePath("/orcamento-ia/materiais");
}

// Tabela de referência de preços por m² enviada pelo usuário — importada de
// uma vez só, e depois editável livremente pela empresa.
const TIPOS_MATERIAL_PADRAO: {
  nome: string;
  valorM2: number;
  ferragemPercent?: number;
  complexidadePercent?: number;
}[] = [
  { nome: "MDF Branco", valorM2: 400, ferragemPercent: 0.2, complexidadePercent: 0.2 },
  { nome: "MDF Amadeirado", valorM2: 500, ferragemPercent: 0.3, complexidadePercent: 0.3 },
  { nome: "MDF Colorido", valorM2: 600, ferragemPercent: 0.4, complexidadePercent: 0.4 },
  { nome: "MDF Marmorizado", valorM2: 700, ferragemPercent: 0.5, complexidadePercent: 0.5 },
  { nome: "Formica", valorM2: 950, ferragemPercent: 0.6, complexidadePercent: 0.6 },
  { nome: "Laminado natural", valorM2: 980, ferragemPercent: 0.7, complexidadePercent: 0.7 },
  { nome: "Pinus Bruto", valorM2: 50, ferragemPercent: 0.8, complexidadePercent: 0.8 },
  { nome: "Pinus Aparelhado", valorM2: 60, ferragemPercent: 0.9, complexidadePercent: 0.9 },
  { nome: "LACCA a avulso", valorM2: 650, ferragemPercent: 1, complexidadePercent: 1 },
  { nome: "LACCA no local", valorM2: 750 },
  { nome: "Piso Cumaru", valorM2: 784 },
  { nome: "Vidro Comum", valorM2: 750 },
  { nome: "Vidro fume", valorM2: 960 },
  { nome: "Box, portas e janelas comum", valorM2: 750 },
  { nome: "Box e janelas Versátik", valorM2: 850 },
  { nome: "Box Open", valorM2: 1010 },
  { nome: "Box Flex", valorM2: 1543 },
  { nome: "Cortina de vidro", valorM2: 1200 },
  { nome: "Guarda Corpo de vidro", valorM2: 2000 },
  { nome: "Espelho lapidado", valorM2: 640 },
  { nome: "Espelho com iluminação sem touch screen", valorM2: 1250 },
  { nome: "Espelho com iluminação com touch screen", valorM2: 1450 },
  { nome: "Mármore", valorM2: 300 },
  { nome: "Granito claro", valorM2: 850 },
  { nome: "Granito escuro", valorM2: 1000 },
  { nome: "Premier", valorM2: 1200 },
  { nome: "Absoluto", valorM2: 2000 },
  { nome: "Quartzo", valorM2: 2500 },
  { nome: "Calacata", valorM2: 3500 },
  { nome: "Stellar", valorM2: 4000 },
  { nome: "Acrílico 10", valorM2: 1031 },
  { nome: "Acrílico 20", valorM2: 2061 },
  { nome: "Acrílico 30", valorM2: 3091 },
  { nome: "Carpete", valorM2: 362 },
  { nome: "Papel de parede", valorM2: 341 },
  { nome: "Linha Suprema", valorM2: 1097.96 },
  { nome: "Linha Gold", valorM2: 1213.85 },
  { nome: "Serralheria de aço", valorM2: 893.38 },
  { nome: "Serralheria de aluminio", valorM2: 870 },
  { nome: "ACM", valorM2: 900 },
  { nome: "Telhado sanduiche e pergolado", valorM2: 810 },
  { nome: "Boiserie de Madeira ou MDF", valorM2: 50 },
];

export async function importarTiposMaterialPadrao() {
  const user = await verifySession().then(() => getUser());
  if (!user) return;

  const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;

  await prisma.tipoMaterialOrcamento.createMany({
    data: TIPOS_MATERIAL_PADRAO.map((t, i) => ({
      empresaId: empresaAtivaId,
      nome: t.nome,
      valorM2: t.valorM2,
      ferragemPercent: t.ferragemPercent ?? 0,
      complexidadePercent: t.complexidadePercent ?? 0,
      ordem: i,
    })),
  });

  revalidatePath("/orcamento-ia/materiais");
}

export async function excluirTipoMaterial(tipoMaterialId: string) {
  await verifySession();
  await prisma.tipoMaterialOrcamento.delete({ where: { id: tipoMaterialId } });
  revalidatePath("/orcamento-ia/materiais");
}

// --- Orçamentos -------------------------------------------------------------

export async function criarOrcamento(formData: FormData) {
  const user = await verifySession().then(() => getUser());
  if (!user) return;

  const nome = formData.get("nome");
  const tipoCliente = formData.get("tipoCliente");
  const obraId = formData.get("obraId");
  if (typeof nome !== "string" || !nome.trim()) return;

  const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;

  const orcamento = await prisma.orcamentoIA.create({
    data: {
      empresaId: empresaAtivaId,
      nome: nome.trim(),
      tipoCliente: typeof tipoCliente === "string" ? (tipoCliente as never) : undefined,
      obraId: typeof obraId === "string" && obraId ? obraId : null,
      criadoPorId: user.id,
    },
  });

  revalidatePath("/orcamento-ia");
  redirect(`/orcamento-ia/${orcamento.id}`);
}

export async function excluirOrcamento(orcamentoId: string) {
  await verifySession();
  await prisma.orcamentoIA.delete({ where: { id: orcamentoId } });
  revalidatePath("/orcamento-ia");
  redirect("/orcamento-ia");
}

export async function atualizarConfigOrcamento(orcamentoId: string, formData: FormData) {
  await verifySession();

  const tipoCliente = formData.get("tipoCliente");
  const margem = formData.get("margemPercent");

  await prisma.orcamentoIA.update({
    where: { id: orcamentoId },
    data: {
      tipoCliente: typeof tipoCliente === "string" ? (tipoCliente as never) : undefined,
      margemPercent: typeof margem === "string" && margem ? Number(margem.replace(",", ".")) / 100 : 0,
    },
  });

  revalidatePath(`/orcamento-ia/${orcamentoId}`);
}

// --- Peças --------------------------------------------------------------

export async function adicionarPeca(orcamentoId: string, formData: FormData) {
  await verifySession();

  const nome = formData.get("nome");
  const comprimento = formData.get("comprimento");
  const largura = formData.get("largura");
  const tipoMaterialId = formData.get("tipoMaterialId");

  if (typeof nome !== "string" || !nome.trim()) return;
  if (typeof comprimento !== "string" || !comprimento) return;
  if (typeof largura !== "string" || !largura) return;
  if (typeof tipoMaterialId !== "string" || !tipoMaterialId) return;

  await prisma.pecaOrcamentoIA.create({
    data: {
      orcamentoId,
      nome: nome.trim(),
      comprimento: Number(comprimento.replace(",", ".")),
      largura: Number(largura.replace(",", ".")),
      tipoMaterialId,
    },
  });

  revalidatePath(`/orcamento-ia/${orcamentoId}`);
}

export async function excluirPeca(pecaId: string, orcamentoId: string) {
  await verifySession();
  await prisma.pecaOrcamentoIA.delete({ where: { id: pecaId } });
  revalidatePath(`/orcamento-ia/${orcamentoId}`);
}
