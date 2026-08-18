"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { MaterialFormSchema, type MaterialFormState } from "@/lib/definitions";

export async function saveMaterial(
  _state: MaterialFormState,
  formData: FormData
): Promise<MaterialFormState> {
  await verifySession();

  const materialId = formData.get("materialId");
  const isEdicao = typeof materialId === "string" && materialId.length > 0;

  const validatedFields = MaterialFormSchema.safeParse({
    nome: formData.get("nome"),
    unidade: formData.get("unidade"),
    categoria: formData.get("categoria"),
    precoReferencia: formData.get("precoReferencia"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { nome, unidade, categoria, precoReferencia } = validatedFields.data;

  const payload = {
    nome,
    unidade,
    categoria: categoria || null,
    precoReferencia: precoReferencia ? Number(precoReferencia.replace(",", ".")) : null,
  };

  if (isEdicao) {
    await prisma.material.update({
      where: { id: materialId as string },
      data: payload,
    });
  } else {
    const user = await getUser();
    if (!user) {
      return { message: "Sessão expirada. Faça login novamente." };
    }
    const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;
    await prisma.material.create({
      data: { ...payload, empresaId: empresaAtivaId },
    });
  }

  revalidatePath("/materiais");
  redirect("/materiais");
}
