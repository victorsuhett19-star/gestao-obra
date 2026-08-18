"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import type { MontagemFormState } from "@/lib/definitions";

export async function saveMontagem(
  _state: MontagemFormState,
  formData: FormData
): Promise<MontagemFormState> {
  await verifySession();

  const obraId = formData.get("obraId") as string;
  const montadorId = formData.get("montadorId") as string;
  const dataChegada = formData.get("dataChegada") as string;

  const ambienteNomes = formData.getAll("ambienteNome") as string[];
  const ambientePedidos = formData.getAll("ambientePedido") as string[];
  const ambienteNotas = formData.getAll("ambienteNotaFiscal") as string[];
  const ambienteVolumes = formData.getAll("ambienteVolumes") as string[];
  const ambienteValores = formData.getAll("ambienteValor") as string[];

  const ambientes = ambienteNomes
    .map((nome, i) => ({
      nome,
      numeroPedido: ambientePedidos[i] || null,
      notaFiscal: ambienteNotas[i] || null,
      qtdVolumes: ambienteVolumes[i] ? Number(ambienteVolumes[i]) : null,
      valor: Number((ambienteValores[i] ?? "0").replace(",", ".")) || 0,
    }))
    .filter((a) => a.nome.trim());

  if (ambientes.length === 0) {
    return { errors: { ambientes: ["Adicione ao menos um ambiente."] } };
  }

  const extraDescricoes = formData.getAll("itemExtraDescricao") as string[];
  const extraQuantidades = formData.getAll("itemExtraQuantidade") as string[];
  const itensExtras = extraDescricoes
    .map((descricao, i) => ({
      descricao,
      quantidade: Number(extraQuantidades[i] ?? "1") || 1,
    }))
    .filter((i) => i.descricao.trim());

  const faltaPedidos = formData.getAll("faltaPedido") as string[];
  const faltaVolumes = formData.getAll("faltaVolume") as string[];
  const faltasFabrica = faltaPedidos
    .map((numeroPedido, i) => ({
      numeroPedido: numeroPedido || null,
      numeroVolume: faltaVolumes[i] || null,
    }))
    .filter((f) => f.numeroPedido);

  const valorTotal = ambientes.reduce((acc, a) => acc + a.valor, 0);

  const registro = await prisma.registroMontagem.create({
    data: {
      obraId,
      montadorId: montadorId || null,
      dataChegada: dataChegada ? new Date(dataChegada) : null,
      valorTotal,
      ambientes: { create: ambientes },
      itensExtras: { create: itensExtras },
      faltasFabrica: { create: faltasFabrica },
    },
  });

  revalidatePath(`/obras/${obraId}/montagem`);
  redirect(`/obras/${obraId}/montagem/${registro.id}`);
}

export async function alternarItemExtra(itemId: string, obraId: string) {
  await verifySession();
  const item = await prisma.itemExtraMontagem.findUnique({ where: { id: itemId } });
  if (!item) return;
  await prisma.itemExtraMontagem.update({
    where: { id: itemId },
    data: { recebido: !item.recebido },
  });
  revalidatePath(`/obras/${obraId}/montagem`);
}

export async function alternarFaltaFabrica(faltaId: string, obraId: string) {
  await verifySession();
  const falta = await prisma.faltaFabricaMontagem.findUnique({ where: { id: faltaId } });
  if (!falta) return;
  await prisma.faltaFabricaMontagem.update({
    where: { id: faltaId },
    data: { recebido: !falta.recebido },
  });
  revalidatePath(`/obras/${obraId}/montagem`);
}

export async function atualizarStatusMontagem(
  registroId: string,
  obraId: string,
  status: "FILA" | "EM_ANDAMENTO" | "CONCLUIDA"
) {
  await verifySession();

  if (status === "EM_ANDAMENTO") {
    const pendencias = await prisma.itemExtraMontagem.count({
      where: { registroId, recebido: false },
    });
    const faltasPendentes = await prisma.faltaFabricaMontagem.count({
      where: { registroId, recebido: false },
    });
    if (pendencias > 0 || faltasPendentes > 0) {
      return {
        message:
          "Marque todos os itens extras e faltas de fábrica como recebidos antes de iniciar a montagem.",
      };
    }
  }

  await prisma.registroMontagem.update({
    where: { id: registroId },
    data: { status },
  });
  revalidatePath(`/obras/${obraId}/montagem`);
  return undefined;
}

export async function deleteMontagem(registroId: string, obraId: string) {
  await verifySession();
  await prisma.registroMontagem.delete({ where: { id: registroId } });
  revalidatePath(`/obras/${obraId}/montagem`);
}
