"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser, requireRole } from "@/lib/dal";
import {
  LancamentoFormSchema,
  type LancamentoFormState,
} from "@/lib/definitions";

export async function saveLancamento(
  _state: LancamentoFormState,
  formData: FormData
): Promise<LancamentoFormState> {
  await verifySession();

  const lancamentoId = formData.get("lancamentoId");
  const isEdicao = typeof lancamentoId === "string" && lancamentoId.length > 0;

  const validatedFields = LancamentoFormSchema.safeParse({
    obraId: formData.get("obraId"),
    itemOrcamentoId: formData.get("itemOrcamentoId"),
    tipo: formData.get("tipo"),
    categoria: formData.get("categoria"),
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
    data: formData.get("data"),
    formaPagamento: formData.get("formaPagamento"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const {
    obraId,
    itemOrcamentoId,
    tipo,
    categoria,
    descricao,
    valor,
    data,
    formaPagamento,
  } = validatedFields.data;

  const valorNumerico = Number(valor.replace(",", "."));
  if (Number.isNaN(valorNumerico)) {
    return { message: "Valor precisa ser um número." };
  }

  const payload = {
    obraId,
    itemOrcamentoId: itemOrcamentoId || null,
    tipo,
    categoria: categoria || null,
    descricao,
    valor: valorNumerico,
    data: new Date(data),
    formaPagamento: formaPagamento || null,
  };

  if (isEdicao) {
    await prisma.lancamentoFinanceiro.update({
      where: { id: lancamentoId as string },
      data: payload,
    });
  } else {
    const user = await getUser();
    await prisma.lancamentoFinanceiro.create({
      data: { ...payload, criadoPorId: user?.id },
    });
  }

  const voltarPara = formData.get("voltarPara");
  const destino =
    typeof voltarPara === "string" && voltarPara
      ? voltarPara
      : `/obras/${obraId}/financeiro`;

  revalidatePath(`/obras/${obraId}/financeiro`);
  revalidatePath(`/projetos/${obraId}/financeiro`);
  redirect(destino);
}

export async function deleteLancamento(lancamentoId: string, obraId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.lancamentoFinanceiro.delete({ where: { id: lancamentoId } });
  revalidatePath(`/obras/${obraId}/financeiro`);
  revalidatePath(`/projetos/${obraId}/financeiro`);
  revalidatePath(`/projetos/${obraId}/dashboard`);
}
