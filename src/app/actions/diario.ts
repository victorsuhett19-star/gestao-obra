"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser, requireRole } from "@/lib/dal";
import { salvarArquivo } from "@/lib/uploads";
import { DiarioFormSchema, type DiarioFormState } from "@/lib/definitions";

export async function saveDiario(
  _state: DiarioFormState,
  formData: FormData
): Promise<DiarioFormState> {
  await verifySession();

  const validatedFields = DiarioFormSchema.safeParse({
    obraId: formData.get("obraId"),
    data: formData.get("data"),
    clima: formData.get("clima"),
    terceirizados: formData.get("terceirizados"),
    atividadesRealizadas: formData.get("atividadesRealizadas"),
    necessidades: formData.get("necessidades"),
    colaboradorIds: formData.getAll("colaboradorIds"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const {
    obraId,
    data,
    clima,
    terceirizados,
    atividadesRealizadas,
    necessidades,
    colaboradorIds,
  } = validatedFields.data;

  const user = await getUser();

  const diario = await prisma.diarioObra.create({
    data: {
      obraId,
      data: new Date(data),
      clima: clima || null,
      terceirizados: terceirizados || null,
      atividadesRealizadas,
      necessidades: necessidades || null,
      criadoPorId: user?.id,
      colaboradores: {
        create: (colaboradorIds ?? []).map((colaboradorId) => ({
          colaboradorId,
        })),
      },
    },
  });

  // Fotos são opcionais — cada <input type="file" name="fotos"> pode trazer
  // vários arquivos; ignoramos entradas vazias (quando nenhum arquivo é anexado).
  const arquivos = formData.getAll("fotos") as File[];
  for (const arquivo of arquivos) {
    if (arquivo && arquivo.size > 0 && user?.empresaId) {
      const url = await salvarArquivo(arquivo, user.empresaId);
      await prisma.foto.create({
        data: {
          obraId,
          diarioId: diario.id,
          url,
          enviadoPorId: user?.id,
        },
      });
    }
  }

  revalidatePath(`/obras/${obraId}/diario`);
  redirect(`/obras/${obraId}/diario`);
}

export async function deleteDiario(diarioId: string, obraId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.diarioObra.delete({ where: { id: diarioId } });
  revalidatePath(`/obras/${obraId}/diario`);
}
