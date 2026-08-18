"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import {
  EtapaProjetoTemplateFormSchema,
  type EtapaProjetoTemplateFormState,
} from "@/lib/definitions";

export async function criarEtapaTemplate(
  _state: EtapaProjetoTemplateFormState,
  formData: FormData
): Promise<EtapaProjetoTemplateFormState> {
  await requireRole(["ADMIN", "GESTOR"]);

  const validatedFields = EtapaProjetoTemplateFormSchema.safeParse({
    trade: formData.get("trade"),
    nome: formData.get("nome"),
    grupo: formData.get("grupo"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  const { trade, nome, grupo } = validatedFields.data;

  const empresaAtivaId = await getEmpresaAtivaId();
  if (!empresaAtivaId) return { message: "Sessão expirada. Faça login novamente." };

  const ultima = await prisma.etapaProjetoTemplate.findFirst({
    where: { empresaId: empresaAtivaId, trade },
    orderBy: { ordem: "desc" },
  });

  await prisma.etapaProjetoTemplate.create({
    data: {
      empresaId: empresaAtivaId,
      trade,
      nome,
      grupo: grupo || null,
      ordem: (ultima?.ordem ?? -1) + 1,
    },
  });

  revalidatePath("/projetos/configurar");
}

export async function excluirEtapaTemplate(id: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.etapaProjetoTemplate.delete({ where: { id } });
  revalidatePath("/projetos/configurar");
}

export async function moverEtapaTemplate(id: string, direcao: "up" | "down") {
  await requireRole(["ADMIN", "GESTOR"]);

  const atual = await prisma.etapaProjetoTemplate.findUnique({ where: { id } });
  if (!atual) return;

  const vizinho = await prisma.etapaProjetoTemplate.findFirst({
    where: {
      empresaId: atual.empresaId,
      trade: atual.trade,
      ordem: direcao === "up" ? { lt: atual.ordem } : { gt: atual.ordem },
    },
    orderBy: { ordem: direcao === "up" ? "desc" : "asc" },
  });
  if (!vizinho) return;

  await prisma.$transaction([
    prisma.etapaProjetoTemplate.update({
      where: { id: atual.id },
      data: { ordem: vizinho.ordem },
    }),
    prisma.etapaProjetoTemplate.update({
      where: { id: vizinho.id },
      data: { ordem: atual.ordem },
    }),
  ]);

  revalidatePath("/projetos/configurar");
}
