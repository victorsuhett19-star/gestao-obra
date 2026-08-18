"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import {
  ColaboradorFormSchema,
  type ColaboradorFormState,
} from "@/lib/definitions";

export async function saveColaborador(
  _state: ColaboradorFormState,
  formData: FormData
): Promise<ColaboradorFormState> {
  await verifySession();

  const colaboradorId = formData.get("colaboradorId");
  const isEdicao = typeof colaboradorId === "string" && colaboradorId.length > 0;

  const validatedFields = ColaboradorFormSchema.safeParse({
    nome: formData.get("nome"),
    funcao: formData.get("funcao"),
    telefone: formData.get("telefone"),
    fotoUrl: formData.get("fotoUrl"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { nome, funcao, telefone, fotoUrl } = validatedFields.data;

  const payload = {
    nome,
    funcao: funcao || null,
    telefone: telefone || null,
    fotoUrl: fotoUrl || null,
  };

  if (isEdicao) {
    await prisma.colaborador.update({
      where: { id: colaboradorId as string },
      data: payload,
    });
  } else {
    const user = await getUser();
    if (!user) {
      return { message: "Sessão expirada. Faça login novamente." };
    }
    await prisma.colaborador.create({
      data: { ...payload, empresaId: user.empresaId },
    });
  }

  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function alternarAtivoColaborador(colaboradorId: string) {
  await verifySession();
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: colaboradorId },
  });
  if (!colaborador) return;

  await prisma.colaborador.update({
    where: { id: colaboradorId },
    data: { ativo: !colaborador.ativo },
  });
  revalidatePath("/colaboradores");
}
