"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import {
  ContaFinanceiraFormSchema,
  type ContaFinanceiraFormState,
} from "@/lib/definitions";

export async function saveContaFinanceira(
  _state: ContaFinanceiraFormState,
  formData: FormData
): Promise<ContaFinanceiraFormState> {
  await requireRole(["ADMIN", "GESTOR"]);

  const validatedFields = ContaFinanceiraFormSchema.safeParse({
    tipo: formData.get("tipo"),
    descricao: formData.get("descricao"),
    categoria: formData.get("categoria"),
    valor: formData.get("valor"),
    dataVencimento: formData.get("dataVencimento"),
    fornecedorId: formData.get("fornecedorId"),
    obraId: formData.get("obraId"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { tipo, descricao, categoria, valor, dataVencimento, fornecedorId, obraId } =
    validatedFields.data;

  const empresaAtivaId = await getEmpresaAtivaId();
  if (!empresaAtivaId) {
    return { message: "Sessão expirada. Faça login novamente." };
  }

  await prisma.contaFinanceira.create({
    data: {
      empresaId: empresaAtivaId,
      tipo,
      descricao,
      categoria: categoria || null,
      valor: Number(valor.replace(",", ".")),
      dataVencimento: new Date(dataVencimento),
      fornecedorId: fornecedorId || null,
      obraId: obraId || null,
    },
  });

  revalidatePath("/financeiro");
  redirect("/financeiro");
}

export async function marcarContaPaga(contaId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.contaFinanceira.update({
    where: { id: contaId },
    data: { status: "PAGO", dataPagamento: new Date() },
  });
  revalidatePath("/financeiro");
}

export async function deleteContaFinanceira(contaId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.contaFinanceira.delete({ where: { id: contaId } });
  revalidatePath("/financeiro");
}
