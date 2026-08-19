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
    clienteCpfCnpj: formData.get("clienteCpfCnpj"),
    ambienteDesejado: formData.get("ambienteDesejado"),
    origem: formData.get("origem"),
    vendedorId: formData.get("vendedorId"),
    valorEstimado: formData.get("valorEstimado"),
    faixaInvestimento: formData.get("faixaInvestimento"),
    especialidades: formData.getAll("especialidades"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const {
    nomeCliente,
    telefone,
    email,
    clienteCpfCnpj,
    ambienteDesejado,
    origem,
    vendedorId,
    valorEstimado,
    faixaInvestimento,
    especialidades,
  } = validatedFields.data;
  const cor = formData.get("cor");

  const payload = {
    nomeCliente,
    telefone: telefone || null,
    email: email || null,
    clienteCpfCnpj: clienteCpfCnpj || null,
    ambienteDesejado: ambienteDesejado || null,
    origem,
    vendedorId: vendedorId || null,
    valorEstimado: valorEstimado ? Number(valorEstimado.replace(",", ".")) : null,
    faixaInvestimento: faixaInvestimento || null,
    cor: typeof cor === "string" && cor ? cor : null,
  };

  let atendimento;
  if (isEdicao) {
    atendimento = await prisma.atendimento.update({
      where: { id: atendimentoId as string },
      data: payload,
    });
    await prisma.atendimentoTrade.deleteMany({ where: { atendimentoId: atendimento.id } });
  } else {
    const user = await getUser();
    if (!user) return { message: "Sessão expirada. Faça login novamente." };
    const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;
    atendimento = await prisma.atendimento.create({
      data: { ...payload, empresaId: empresaAtivaId },
    });
  }

  if (especialidades && especialidades.length > 0) {
    await prisma.atendimentoTrade.createMany({
      data: especialidades.map((trade) => ({ atendimentoId: atendimento.id, trade })),
      skipDuplicates: true,
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
    include: { especialidades: true },
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
      clienteCpfCnpj: atendimento.clienteCpfCnpj,
      status: "PLANEJAMENTO",
      criadoPorId: user?.id,
      trades: {
        create: atendimento.especialidades.map((e) => ({ trade: e.trade })),
      },
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
