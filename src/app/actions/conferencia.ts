"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import {
  STATUS_CONFERENCIA,
  ItemConferenciaFormSchema,
  type ItemConferenciaFormState,
} from "@/lib/definitions";

export async function saveItemConferencia(
  _state: ItemConferenciaFormState,
  formData: FormData
): Promise<ItemConferenciaFormState> {
  await verifySession();

  const validatedFields = ItemConferenciaFormSchema.safeParse({
    obraId: formData.get("obraId"),
    titulo: formData.get("titulo"),
    responsavelId: formData.get("responsavelId"),
    prazo: formData.get("prazo"),
    observacoes: formData.get("observacoes"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { obraId, titulo, responsavelId, prazo, observacoes } =
    validatedFields.data;

  await prisma.itemConferencia.create({
    data: {
      obraId,
      titulo,
      responsavelId: responsavelId || null,
      prazo: prazo ? new Date(prazo) : null,
      observacoes: observacoes || null,
    },
  });

  revalidatePath(`/obras/${obraId}/conferencia`);
  redirect(`/obras/${obraId}/conferencia`);
}

const ORDEM_STATUS = STATUS_CONFERENCIA;

export async function moverItemConferencia(
  itemId: string,
  obraId: string,
  direcao: "avancar" | "voltar"
) {
  await verifySession();
  const item = await prisma.itemConferencia.findUnique({
    where: { id: itemId },
  });
  if (!item) return;

  const indiceAtual = ORDEM_STATUS.indexOf(item.status);
  const novoIndice =
    direcao === "avancar"
      ? Math.min(indiceAtual + 1, ORDEM_STATUS.length - 1)
      : Math.max(indiceAtual - 1, 0);

  await prisma.itemConferencia.update({
    where: { id: itemId },
    data: { status: ORDEM_STATUS[novoIndice] },
  });

  revalidatePath(`/obras/${obraId}/conferencia`);
}

export async function deleteItemConferencia(itemId: string, obraId: string) {
  await verifySession();
  await prisma.itemConferencia.delete({ where: { id: itemId } });
  revalidatePath(`/obras/${obraId}/conferencia`);
}
