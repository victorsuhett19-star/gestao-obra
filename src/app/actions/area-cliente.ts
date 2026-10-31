"use server";

import { revalidatePath } from "next/cache";
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

  const tipo = formData.get("tipo") === "PAGAMENTO" ? "PAGAMENTO" : "CUSTO";
  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const valor = parseValorBR(String(formData.get("valor") ?? ""));
  const dataStr = String(formData.get("data") ?? "");
  if (!descricao || Number.isNaN(valor) || valor <= 0) return;

  await prisma.lancamentoCliente.create({
    data: {
      obraId,
      tipo,
      descricao,
      categoria: categoria || null,
      valor,
      data: dataStr ? new Date(dataStr) : new Date(),
    },
  });

  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/area-cliente");
}

export async function excluirLancamentoCliente(obraId: string, lancamentoId: string) {
  await exigirAcesso();
  await prisma.lancamentoCliente.delete({ where: { id: lancamentoId, obraId } });
  revalidatePath(`/area-cliente/${obraId}`);
  revalidatePath("/area-cliente");
}
