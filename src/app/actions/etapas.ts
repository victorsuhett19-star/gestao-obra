"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, requireRole } from "@/lib/dal";
import { EtapaFormSchema, type EtapaFormState } from "@/lib/definitions";

export async function saveEtapa(
  _state: EtapaFormState,
  formData: FormData
): Promise<EtapaFormState> {
  await verifySession();

  const etapaId = formData.get("etapaId");
  const isEdicao = typeof etapaId === "string" && etapaId.length > 0;

  const validatedFields = EtapaFormSchema.safeParse({
    obraId: formData.get("obraId"),
    paiId: formData.get("paiId"),
    nome: formData.get("nome"),
    status: formData.get("status"),
    percentualConcluido: formData.get("percentualConcluido"),
    dataInicioPrevista: formData.get("dataInicioPrevista"),
    dataFimPrevista: formData.get("dataFimPrevista"),
    dataInicioReal: formData.get("dataInicioReal"),
    dataFimReal: formData.get("dataFimReal"),
    responsavelId: formData.get("responsavelId"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const {
    obraId,
    paiId,
    nome,
    status,
    percentualConcluido,
    dataInicioPrevista,
    dataFimPrevista,
    dataInicioReal,
    dataFimReal,
    responsavelId,
  } = validatedFields.data;

  // Uma etapa não pode ser pai de si mesma.
  const paiIdFinal = paiId && paiId !== etapaId ? paiId : null;

  const payload = {
    obraId,
    paiId: paiIdFinal,
    nome,
    status,
    percentualConcluido: percentualConcluido
      ? Math.min(100, Math.max(0, Number(percentualConcluido)))
      : 0,
    dataInicioPrevista: dataInicioPrevista ? new Date(dataInicioPrevista) : null,
    dataFimPrevista: dataFimPrevista ? new Date(dataFimPrevista) : null,
    dataInicioReal: dataInicioReal ? new Date(dataInicioReal) : null,
    dataFimReal: dataFimReal ? new Date(dataFimReal) : null,
    responsavelId: responsavelId || null,
  };

  if (isEdicao) {
    await prisma.etapa.update({
      where: { id: etapaId as string },
      data: payload,
    });
  } else {
    await prisma.etapa.create({ data: payload });
  }

  revalidatePath(`/obras/${obraId}/cronograma`);
  redirect(`/obras/${obraId}/cronograma`);
}

export async function deleteEtapa(etapaId: string, obraId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.etapa.delete({ where: { id: etapaId } });
  revalidatePath(`/obras/${obraId}/cronograma`);
}
