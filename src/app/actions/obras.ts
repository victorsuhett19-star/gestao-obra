"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import { ObraFormSchema, type ObraFormState } from "@/lib/definitions";

export async function saveObra(
  _state: ObraFormState,
  formData: FormData
): Promise<ObraFormState> {
  await verifySession();

  const obraId = formData.get("obraId");
  const isEdicao = typeof obraId === "string" && obraId.length > 0;

  const validatedFields = ObraFormSchema.safeParse({
    nome: formData.get("nome"),
    endereco: formData.get("endereco"),
    clienteNome: formData.get("clienteNome"),
    clienteContato: formData.get("clienteContato"),
    status: formData.get("status"),
    dataInicioPrevista: formData.get("dataInicioPrevista"),
    dataFimPrevista: formData.get("dataFimPrevista"),
    trades: formData.getAll("trades"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { trades, endereco, clienteNome, clienteContato, ...rest } =
    validatedFields.data;

  const payload = {
    ...rest,
    endereco: endereco || null,
    clienteNome: clienteNome || null,
    clienteContato: clienteContato || null,
    dataInicioPrevista: rest.dataInicioPrevista
      ? new Date(rest.dataInicioPrevista)
      : null,
    dataFimPrevista: rest.dataFimPrevista
      ? new Date(rest.dataFimPrevista)
      : null,
  };

  let id: string;

  if (isEdicao) {
    const obra = await prisma.obra.update({
      where: { id: obraId as string },
      data: payload,
    });
    await prisma.obraTrade.deleteMany({ where: { obraId: obra.id } });
    await prisma.obraTrade.createMany({
      data: trades.map((trade) => ({ obraId: obra.id, trade })),
    });
    id = obra.id;
  } else {
    const user = await getUser();
    if (!user) {
      return { message: "Sessão expirada. Faça login novamente." };
    }
    const obra = await prisma.obra.create({
      data: {
        ...payload,
        empresaId: user.empresaId,
        criadoPorId: user.id,
        trades: { create: trades.map((trade) => ({ trade })) },
      },
    });
    id = obra.id;
  }

  revalidatePath("/obras");
  revalidatePath(`/obras/${id}`);
  revalidatePath(`/obras/${id}/editar`);
  revalidatePath("/dashboard");
  redirect(`/obras/${id}`);
}
