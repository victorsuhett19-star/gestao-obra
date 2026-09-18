"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { salvarArquivo } from "@/lib/uploads";
import type { AnalisePdfExecutivoState } from "@/lib/definitions";

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

/** Anexa o PDF do executivo ao orçamento — fica só como referência pra
 * equipe consultar; o custo continua vindo da soma das peças lançadas na
 * tabela abaixo, calculada pelo próprio banco de dados. */
export async function anexarPdfExecutivo(orcamentoId: string, formData: FormData) {
  const user = await verifySession().then(() => getUser());
  if (!user) return;

  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) return;

  const url = await salvarArquivo(arquivo, user.empresaId);
  const arquivoId = url.replace("/api/arquivos/", "");

  await prisma.orcamentoIA.update({
    where: { id: orcamentoId },
    data: { arquivoExecutivoId: arquivoId },
  });

  revalidatePath(`/orcamento-ia/${orcamentoId}`);
}

/** Envia o PDF do executivo pra IA ler, extrair as peças (nome, medidas e
 * material) e já lançar tudo no orçamento — o custo sai automaticamente,
 * calculado pelo banco de dados a partir dessas peças (mesma fórmula de
 * quem lança manualmente). Precisa da variável de ambiente
 * ANTHROPIC_API_KEY configurada no servidor. */
export async function analisarPdfExecutivo(
  orcamentoId: string,
  _state: AnalisePdfExecutivoState,
  formData: FormData
): Promise<AnalisePdfExecutivoState> {
  const user = await verifySession().then(() => getUser());
  if (!user) return { message: "Sessão expirada. Faça login novamente." };

  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) {
    return { message: "Selecione um arquivo PDF." };
  }
  if (arquivo.type !== "application/pdf") {
    return { message: "Envie um arquivo em PDF." };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      message:
        "A análise por IA ainda não está configurada — peça pro administrador cadastrar a chave da Anthropic.",
    };
  }

  const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;

  const tiposMaterial = await prisma.tipoMaterialOrcamento.findMany({
    where: { empresaId: empresaAtivaId },
  });
  if (tiposMaterial.length === 0) {
    return {
      message: "Cadastre os materiais na tabela de preços antes de analisar o PDF.",
    };
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());
  const base64 = buffer.toString("base64");
  const listaMateriais = tiposMaterial.map((t) => t.nome).join(", ");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let textoResposta: string;
  try {
    const resposta = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            },
            {
              type: "text",
              text:
                "Você é um especialista em marcenaria lendo um projeto executivo " +
                "(planta baixa, memorial descritivo ou lista de peças). Extraia " +
                "TODAS as peças/painéis do projeto com suas medidas em METROS " +
                "(converta de mm/cm se necessário).\n\n" +
                `Para cada peça, escolha o material da lista abaixo que mais se ` +
                `aproxima — copie o nome EXATAMENTE como está na lista, sem ` +
                `inventar um nome novo: ${listaMateriais}\n\n` +
                "Responda SOMENTE com um JSON válido (sem markdown, sem texto " +
                "antes ou depois), no formato:\n" +
                '[{"nome": "Painel lateral esquerdo", "comprimento": 2.10, ' +
                '"largura": 0.60, "material": "MDF Branco"}]',
            },
          ],
        },
      ],
    });

    const textBlock = resposta.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { message: "A IA não retornou nenhum texto. Tente novamente." };
    }
    textoResposta = textBlock.text;
  } catch (e) {
    return {
      message:
        "Erro ao chamar a IA: " + (e instanceof Error ? e.message : "erro desconhecido"),
    };
  }

  let pecasExtraidas: { nome?: string; comprimento?: number; largura?: number; material?: string }[];
  try {
    const match = textoResposta.match(/\[[\s\S]*\]/);
    pecasExtraidas = JSON.parse(match ? match[0] : textoResposta);
  } catch {
    return {
      message: "Não consegui interpretar a resposta da IA. Tente novamente ou lance as peças manualmente.",
    };
  }

  if (!Array.isArray(pecasExtraidas) || pecasExtraidas.length === 0) {
    return { message: "A IA não encontrou nenhuma peça nesse PDF." };
  }

  const materialPorNome = new Map(tiposMaterial.map((t) => [t.nome.toLowerCase(), t]));

  const pecasParaCriar = pecasExtraidas
    .map((p) => {
      const material =
        materialPorNome.get((p.material ?? "").toLowerCase().trim()) ?? tiposMaterial[0];
      return {
        orcamentoId,
        nome: p.nome?.trim() || "Peça",
        comprimento: Number(p.comprimento) || 0,
        largura: Number(p.largura) || 0,
        tipoMaterialId: material.id,
      };
    })
    .filter((p) => p.comprimento > 0 && p.largura > 0);

  if (pecasParaCriar.length === 0) {
    return { message: "A IA não retornou medidas válidas pra nenhuma peça." };
  }

  const url = await salvarArquivo(arquivo, empresaAtivaId);
  const arquivoId = url.replace("/api/arquivos/", "");

  await prisma.$transaction([
    prisma.orcamentoIA.update({
      where: { id: orcamentoId },
      data: { arquivoExecutivoId: arquivoId },
    }),
    prisma.pecaOrcamentoIA.createMany({ data: pecasParaCriar }),
  ]);

  revalidatePath(`/orcamento-ia/${orcamentoId}`);
  return {
    sucesso: true,
    message: `${pecasParaCriar.length} peça(s) extraída(s) e adicionada(s) ao orçamento.`,
  };
}

export async function removerPdfExecutivo(orcamentoId: string) {
  await verifySession();
  await prisma.orcamentoIA.update({
    where: { id: orcamentoId },
    data: { arquivoExecutivoId: null },
  });
  revalidatePath(`/orcamento-ia/${orcamentoId}`);
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
