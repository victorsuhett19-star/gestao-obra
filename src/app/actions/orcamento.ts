"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, requireRole } from "@/lib/dal";
import {
  ItemOrcamentoFormSchema,
  type ItemOrcamentoFormState,
} from "@/lib/definitions";

export async function saveItemOrcamento(
  _state: ItemOrcamentoFormState,
  formData: FormData
): Promise<ItemOrcamentoFormState> {
  await verifySession();

  const itemId = formData.get("itemId");
  const isEdicao = typeof itemId === "string" && itemId.length > 0;

  const validatedFields = ItemOrcamentoFormSchema.safeParse({
    obraId: formData.get("obraId"),
    etapaId: formData.get("etapaId"),
    categoria: formData.get("categoria"),
    descricao: formData.get("descricao"),
    unidade: formData.get("unidade"),
    quantidade: formData.get("quantidade"),
    valorUnitario: formData.get("valorUnitario"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { obraId, etapaId, categoria, descricao, unidade, quantidade, valorUnitario } =
    validatedFields.data;

  const qtd = Number(quantidade.replace(",", "."));
  const valorUnit = Number(valorUnitario.replace(",", "."));

  if (Number.isNaN(qtd) || Number.isNaN(valorUnit)) {
    return { message: "Quantidade e valor unitário precisam ser números." };
  }

  const payload = {
    obraId,
    etapaId: etapaId || null,
    categoria,
    descricao,
    unidade: unidade || null,
    quantidade: qtd,
    valorUnitario: valorUnit,
    valorTotal: qtd * valorUnit,
  };

  if (isEdicao) {
    await prisma.itemOrcamento.update({
      where: { id: itemId as string },
      data: payload,
    });
  } else {
    await prisma.itemOrcamento.create({ data: payload });
  }

  const voltarPara = formData.get("voltarPara");
  const destino =
    typeof voltarPara === "string" && voltarPara
      ? voltarPara
      : `/obras/${obraId}/orcamento`;

  revalidatePath(`/obras/${obraId}/orcamento`);
  revalidatePath(`/projetos/${obraId}/orcamento`);
  redirect(destino);
}

export async function deleteItemOrcamento(itemId: string, obraId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.itemOrcamento.delete({ where: { id: itemId } });
  revalidatePath(`/obras/${obraId}/orcamento`);
  revalidatePath(`/projetos/${obraId}/orcamento`);
}
