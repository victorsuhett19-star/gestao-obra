"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser, requireRole } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
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
  const cor = formData.get("cor");

  const payload = {
    nomeCliente,
    telefone: telefone || null,
    email: email || null,
    ambienteDesejado: ambienteDesejado || null,
    origem,
    vendedorId: vendedorId || null,
    valorEstimado: valorEstimado ? Number(valorEstimado.replace(",", ".")) : null,
    cor: typeof cor === "string" && cor ? cor : null,
  };

  if (isEdicao) {
    await prisma.atendimento.update({
      where: { id: atendimentoId as string },
      data: payload,
    });
  } else {
    const user = await getUser();
    if (!user) return { message: "Sessão expirada. Faça login novamente." };
    const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;
    await prisma.atendimento.create({
      data: { ...payload, empresaId: empresaAtivaId },
    });
  }

  revalidatePath("/atendimento");
  redirect("/atendimento");
}

/** Move o atendimento direto pra qualquer etapa (arrastar-e-soltar no
 * Kanban), sem precisar passar pelas etapas intermediárias. */
export async function moverAtendimentoPara(atendimentoId: string, novoStatus: string) {
  await verifySession();
  if (!STATUS_ATENDIMENTO.includes(novoStatus as (typeof STATUS_ATENDIMENTO)[number])) return;
  await prisma.atendimento.update({
    where: { id: atendimentoId },
    data: { status: novoStatus as never },
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
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.atendimento.delete({ where: { id: atendimentoId } });
  revalidatePath("/atendimento");
}
