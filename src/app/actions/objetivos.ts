"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { ObjetivoFormSchema, type ObjetivoFormState } from "@/lib/definitions";

export async function addObjetivo(
  _state: ObjetivoFormState,
  formData: FormData
): Promise<ObjetivoFormState> {
  await verifySession();

  const validatedFields = ObjetivoFormSchema.safeParse({
    obraId: formData.get("obraId"),
    descricao: formData.get("descricao"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { obraId, descricao } = validatedFields.data;

  await prisma.objetivoDiario.create({ data: { obraId, descricao } });

  revalidatePath(`/obras/${obraId}/diario`);
  return undefined;
}

export async function alternarObjetivo(objetivoId: string, obraId: string) {
  await verifySession();
  const objetivo = await prisma.objetivoDiario.findUnique({
    where: { id: objetivoId },
  });
  if (!objetivo) return;

  await prisma.objetivoDiario.update({
    where: { id: objetivoId },
    data: { concluido: !objetivo.concluido },
  });
  revalidatePath(`/obras/${obraId}/diario`);
}
