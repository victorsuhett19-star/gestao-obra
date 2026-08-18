"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, requireRole } from "@/lib/dal";
import {
  PontoFormSchema,
  type PontoFormState,
  FolgaFormSchema,
  type FolgaFormState,
  FolhaFormSchema,
  type FolhaFormState,
} from "@/lib/definitions";

function path(colaboradorId: string) {
  return `/rh/${colaboradorId}`;
}

export async function registrarPonto(
  _state: PontoFormState,
  formData: FormData
): Promise<PontoFormState> {
  await verifySession();

  const validatedFields = PontoFormSchema.safeParse({
    colaboradorId: formData.get("colaboradorId"),
    data: formData.get("data"),
    tipo: formData.get("tipo"),
    horaEntrada: formData.get("horaEntrada"),
    horaSaida: formData.get("horaSaida"),
    observacao: formData.get("observacao"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { colaboradorId, data, tipo, horaEntrada, horaSaida, observacao } =
    validatedFields.data;

  await prisma.registroPonto.upsert({
    where: { colaboradorId_data: { colaboradorId, data: new Date(data) } },
    update: {
      tipo,
      horaEntrada: horaEntrada || null,
      horaSaida: horaSaida || null,
      observacao: observacao || null,
    },
    create: {
      colaboradorId,
      data: new Date(data),
      tipo,
      horaEntrada: horaEntrada || null,
      horaSaida: horaSaida || null,
      observacao: observacao || null,
    },
  });

  revalidatePath(path(colaboradorId));
  return undefined;
}

export async function addFolga(
  _state: FolgaFormState,
  formData: FormData
): Promise<FolgaFormState> {
  await verifySession();

  const validatedFields = FolgaFormSchema.safeParse({
    colaboradorId: formData.get("colaboradorId"),
    tipo: formData.get("tipo"),
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim"),
    observacao: formData.get("observacao"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { colaboradorId, tipo, dataInicio, dataFim, observacao } =
    validatedFields.data;

  await prisma.folgaFerias.create({
    data: {
      colaboradorId,
      tipo,
      dataInicio: new Date(dataInicio),
      dataFim: new Date(dataFim),
      observacao: observacao || null,
    },
  });

  revalidatePath(path(colaboradorId));
  return undefined;
}

export async function atualizarStatusFolga(
  folgaId: string,
  colaboradorId: string,
  status: "SOLICITADA" | "APROVADA" | "RECUSADA"
) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.folgaFerias.update({ where: { id: folgaId }, data: { status } });
  revalidatePath(path(colaboradorId));
}

export async function addFolha(
  _state: FolhaFormState,
  formData: FormData
): Promise<FolhaFormState> {
  await requireRole(["ADMIN", "GESTOR"]);

  const validatedFields = FolhaFormSchema.safeParse({
    colaboradorId: formData.get("colaboradorId"),
    mesReferencia: formData.get("mesReferencia"),
    salarioBase: formData.get("salarioBase"),
    descontos: formData.get("descontos"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { colaboradorId, mesReferencia, salarioBase, descontos } =
    validatedFields.data;

  const salario = Number(salarioBase.replace(",", "."));
  const desc = descontos ? Number(descontos.replace(",", ".")) : 0;

  await prisma.folhaPagamento.upsert({
    where: { colaboradorId_mesReferencia: { colaboradorId, mesReferencia } },
    update: { salarioBase: salario, descontos: desc, valorLiquido: salario - desc },
    create: {
      colaboradorId,
      mesReferencia,
      salarioBase: salario,
      descontos: desc,
      valorLiquido: salario - desc,
    },
  });

  revalidatePath(path(colaboradorId));
  return undefined;
}

export async function marcarFolhaPaga(folhaId: string, colaboradorId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.folhaPagamento.update({
    where: { id: folhaId },
    data: { status: "PAGA", pagoEm: new Date() },
  });
  revalidatePath(path(colaboradorId));
}
