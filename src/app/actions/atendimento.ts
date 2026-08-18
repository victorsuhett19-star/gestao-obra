"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import {
  STATUS_ATENDIMENTO,
  AtendimentoFormSchema,
  type AtendimentoFormState,
} from "@/lib/definitions";

export async function saveAtendimento(
  _state: AtendimentoFormState,
  formData: FormData
): Promise<AtendimentoFormState> {
  await verifySession();

  const atendimentoId = formData.get("atendimentoId");
  const isEdicao = typeof atendimentoId === "string" && atendimentoId.length > 0;

  const validatedFields = AtendimentoFormSchema.safeParse({
    nomeCliente: formData.get("nomeCliente"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
    ambienteDesejado: formData.get("ambienteDesejado"),
    origem: formData.get("origem"),
    vendedorId: formData.get("vendedorId"),
    valorEstimado: formData.get("valorEstimado"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { nomeCliente, telefone, email, ambienteDesejado, origem, vendedorId, valorEstimado } =
    validatedFields.data;

  const payload = {
    nomeCliente,
    telefone: telefone || null,
    email: email || null,
    ambienteDesejado: ambienteDesejado || null,
    origem,
    vendedorId: vendedorId || null,
    valorEstimado: valorEstimado ? Number(valorEstimado.replace(",", ".")) : null,
  };

  if (isEdicao) {
    await prisma.atendimento.update({
      where: { id: atendimentoId as string },
      data: payload,
    });
  } else {
    const user = await getUser();
    if (!user) return { message: "Sessão expirada. Faça login novamente." };
    await prisma.atendimento.create({
      data: { ...payload, empresaId: user.empresaId },
    });
  }

  revalidatePath("/atendimento");
  redirect("/atendimento");
}

const ORDEM_STATUS = STATUS_ATENDIMENTO;

export async function moverAtendimento(
  atendimentoId: string,
  direcao: "avancar" | "voltar"
) {
  await verifySession();
  const item = await prisma.atendimento.findUnique({ where: { id: atendimentoId } });
  if (!item) return;

  const indiceAtual = ORDEM_STATUS.indexOf(item.status);
  const novoIndice =
    direcao === "avancar"
      ? Math.min(indiceAtual + 1, ORDEM_STATUS.length - 1)
      : Math.max(indiceAtual - 1, 0);

  await prisma.atendimento.update({
    where: { id: atendimentoId },
    data: { status: ORDEM_STATUS[novoIndice] },
  });
  revalidatePath("/atendimento");
}

export async function marcarPerdido(atendimentoId: string, formData: FormData) {
  await verifySession();
  const motivo = formData.get("motivo") as string | null;
  await prisma.atendimento.update({
    where: { id: atendimentoId },
    data: { status: "PERDIDO", motivoPerda: motivo || null },
  });
  revalidatePath("/atendimento");
  redirect("/atendimento");
}

export async function converterEmObra(atendimentoId: string) {
  await verifySession();
  const atendimento = await prisma.atendimento.findUnique({
    where: { id: atendimentoId },
  });
  if (!atendimento) return;

  const user = await getUser();

  const obra = await prisma.obra.create({
    data: {
      empresaId: atendimento.empresaId,
      nome: `${atendimento.nomeCliente}${atendimento.ambienteDesejado ? ` — ${atendimento.ambienteDesejado}` : ""}`,
      clienteNome: atendimento.nomeCliente,
      clienteTelefone: atendimento.telefone,
      clienteEmail: atendimento.email,
      status: "PLANEJAMENTO",
      criadoPorId: user?.id,
    },
  });

  await prisma.atendimento.update({
    where: { id: atendimentoId },
    data: { status: "GANHO", obraId: obra.id },
  });

  revalidatePath("/atendimento");
  revalidatePath("/obras");
  redirect(`/obras/${obra.id}`);
}

export async function deleteAtendimento(atendimentoId: string) {
  await verifySession();
  await prisma.atendimento.delete({ where: { id: atendimentoId } });
  revalidatePath("/atendimento");
}
