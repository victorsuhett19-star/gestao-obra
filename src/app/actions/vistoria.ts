"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import type { VistoriaFormState } from "@/lib/definitions";

export async function saveVistoria(
  _state: VistoriaFormState,
  formData: FormData
): Promise<VistoriaFormState> {
  await verifySession();

  const obraId = formData.get("obraId") as string;
  const observacoesCliente = (formData.get("observacoesCliente") as string) || null;

  const ambientes = formData.getAll("itemAmbiente") as string[];
  const statusList = formData.getAll("itemStatus") as string[];
  const observacoesList = formData.getAll("itemObservacao") as string[];

  const itens = ambientes
    .map((ambiente, i) => ({
      ambiente,
      status: (statusList[i] as
        | "PENDENTE"
        | "CONCLUIDO_SEM_OCORRENCIA"
        | "CONCLUIDO_COM_OCORRENCIA") ?? "PENDENTE",
      observacao: observacoesList[i] || null,
    }))
    .filter((i) => i.ambiente.trim());

  if (itens.length === 0) {
    return { errors: { itens: ["Adicione ao menos um ambiente."] } };
  }

  const user = await getUser();

  const vistoria = await prisma.vistoriaFinal.create({
    data: {
      obraId,
      responsavelId: user?.id,
      observacoesCliente,
      itens: { create: itens },
    },
  });

  revalidatePath(`/obras/${obraId}/vistoria`);
  redirect(`/obras/${obraId}/vistoria/${vistoria.id}`);
}

export async function assinarVistoria(
  vistoriaId: string,
  obraId: string,
  quem: "responsavel" | "cliente"
) {
  await verifySession();
  await prisma.vistoriaFinal.update({
    where: { id: vistoriaId },
    data:
      quem === "responsavel"
        ? { assinadoResponsavelEm: new Date() }
        : { assinadoClienteEm: new Date() },
  });
  revalidatePath(`/obras/${obraId}/vistoria`);
}

export async function deleteVistoria(vistoriaId: string, obraId: string) {
  await verifySession();
  await prisma.vistoriaFinal.delete({ where: { id: vistoriaId } });
  revalidatePath(`/obras/${obraId}/vistoria`);
}
