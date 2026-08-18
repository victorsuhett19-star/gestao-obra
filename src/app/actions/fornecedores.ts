"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import {
  FornecedorFormSchema,
  type FornecedorFormState,
} from "@/lib/definitions";

export async function saveFornecedor(
  _state: FornecedorFormState,
  formData: FormData
): Promise<FornecedorFormState> {
  await verifySession();

  const fornecedorId = formData.get("fornecedorId");
  const isEdicao = typeof fornecedorId === "string" && fornecedorId.length > 0;

  const validatedFields = FornecedorFormSchema.safeParse({
    nome: formData.get("nome"),
    cnpjCpf: formData.get("cnpjCpf"),
    contato: formData.get("contato"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    especialidade: formData.get("especialidade"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { nome, cnpjCpf, contato, telefone, email, especialidade } =
    validatedFields.data;

  const payload = {
    nome,
    cnpjCpf: cnpjCpf || null,
    contato: contato || null,
    telefone: telefone || null,
    email: email || null,
    especialidade: especialidade || null,
  };

  if (isEdicao) {
    await prisma.fornecedor.update({
      where: { id: fornecedorId as string },
      data: payload,
    });
  } else {
    const user = await getUser();
    if (!user) {
      return { message: "Sessão expirada. Faça login novamente." };
    }
    await prisma.fornecedor.create({
      data: { ...payload, empresaId: user.empresaId },
    });
  }

  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}
