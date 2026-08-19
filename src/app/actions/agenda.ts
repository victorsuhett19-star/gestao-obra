"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser, requireRole } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { EventoFormSchema, type EventoFormState } from "@/lib/definitions";

export async function saveEvento(
  _state: EventoFormState,
  formData: FormData
): Promise<EventoFormState> {
  await verifySession();

  const validatedFields = EventoFormSchema.safeParse({
    titulo: formData.get("titulo"),
    tipo: formData.get("tipo"),
    data: formData.get("data"),
    hora: formData.get("hora"),
    obraId: formData.get("obraId"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { titulo, tipo, data, hora, obraId } = validatedFields.data;
  const cor = formData.get("cor");

  const dataHora = new Date(`${data}T${hora || "00:00"}:00`);

  const user = await getUser();
  if (!user) return { message: "Sessão expirada. Faça login novamente." };
  const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;

  await prisma.evento.create({
    data: {
      empresaId: empresaAtivaId,
      titulo,
      tipo,
      data: dataHora,
      cor: typeof cor === "string" && cor ? cor : null,
      obraId: obraId || null,
      criadoPorId: user.id,
    },
  });

  const voltarPara = formData.get("voltarPara");
  const destino =
    typeof voltarPara === "string" && voltarPara ? voltarPara : "/agenda";

  revalidatePath("/agenda");
  if (obraId) revalidatePath(`/projetos/${obraId}/agenda`);
  redirect(destino);
}

export async function deleteEvento(eventoId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  const evento = await prisma.evento.delete({ where: { id: eventoId } });
  revalidatePath("/agenda");
  if (evento.obraId) revalidatePath(`/projetos/${evento.obraId}/agenda`);
}
