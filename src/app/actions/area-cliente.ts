"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { podeVerModulo } from "@/lib/modulos";
import { parseValorBR } from "@/lib/labels";

async function exigirAcesso() {
  const user = await getUser();
  if (!podeVerModulo(user, "areacliente")) {
    throw new Error("Você não tem acesso à Área do cliente.");
  }
}

export async function adicionarLancamentoCliente(obraId: string, formData: FormData) {
  await exigirAcesso();

  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const valor = parseValorBR(String(formData.get("valor") ?? ""));
  const dataStr = String(formData.get("data") ?? "");
  if (!descricao || Number.isNaN(valor) || valor <= 0) return;

  await prisma.lancamentoCliente.create({
    data: {
      obraId,
      tipo: "CUSTO",
      descricao,
      categoria: categoria || null,
      valor,
      data: dataStr ? new Date(dataStr) : new Date(),
    },
  });

  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/area-cliente");
  revalidatePath("/portal");
}

export async function excluirLancamentoCliente(obraId: string, lancamentoId: string) {
  await exigirAcesso();
  await prisma.lancamentoCliente.delete({ where: { id: lancamentoId, obraId } });
  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/area-cliente");
  revalidatePath("/portal");
}

export async function editarLancamentoCliente(
  obraId: string,
  lancamentoId: string,
  formData: FormData
) {
  await exigirAcesso();

  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const valor = parseValorBR(String(formData.get("valor") ?? ""));
  const dataStr = String(formData.get("data") ?? "");
  if (descricao && !Number.isNaN(valor) && valor > 0) {
    await prisma.lancamentoCliente.update({
      where: { id: lancamentoId, obraId },
      data: {
        descricao,
        categoria: categoria || null,
        valor,
        ...(dataStr ? { data: new Date(dataStr) } : {}),
      },
    });
  }

  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/area-cliente");
  revalidatePath("/portal");
  redirect(`/area-cliente/${obraId}`);
}

/** Liga/desliga a exibição do financeiro no portal do cliente. */
export async function alternarFinanceiroPortal(obraId: string) {
  await exigirAcesso();
  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    select: { financeiroPortalVisivel: true },
  });
  if (!obra) return;
  await prisma.obra.update({
    where: { id: obraId },
    data: { financeiroPortalVisivel: !obra.financeiroPortalVisivel },
  });
  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/portal");
}
