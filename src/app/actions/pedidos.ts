"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser, requireRole } from "@/lib/dal";
import { STATUS_PEDIDO, type PedidoFormState } from "@/lib/definitions";

export async function savePedido(
  _state: PedidoFormState,
  formData: FormData
): Promise<PedidoFormState> {
  await verifySession();

  const obraId = formData.get("obraId");
  const fornecedorId = formData.get("fornecedorId");
  const dataEntregaPrevista = formData.get("dataEntregaPrevista");

  if (typeof obraId !== "string" || !obraId) {
    return { message: "Obra inválida." };
  }
  if (typeof fornecedorId !== "string" || !fornecedorId) {
    return { errors: { fornecedorId: ["Selecione um fornecedor."] } };
  }

  const materialIds = formData.getAll("itemMaterialId") as string[];
  const quantidades = formData.getAll("itemQuantidade") as string[];
  const valores = formData.getAll("itemValorUnitario") as string[];

  const itens = materialIds
    .map((materialId, i) => ({
      materialId,
      quantidade: Number((quantidades[i] ?? "0").replace(",", ".")),
      valorUnitario: Number((valores[i] ?? "0").replace(",", ".")),
    }))
    .filter((item) => item.materialId && item.quantidade > 0);

  if (itens.length === 0) {
    return { errors: { itens: ["Adicione ao menos um item com quantidade."] } };
  }

  const valorTotal = itens.reduce(
    (acc, i) => acc + i.quantidade * i.valorUnitario,
    0
  );

  const user = await getUser();

  await prisma.pedidoMaterial.create({
    data: {
      obraId,
      fornecedorId,
      dataEntregaPrevista: dataEntregaPrevista
        ? new Date(dataEntregaPrevista as string)
        : null,
      valorTotal,
      criadoPorId: user?.id,
      itens: {
        create: itens.map((i) => ({
          materialId: i.materialId,
          quantidade: i.quantidade,
          valorUnitario: i.valorUnitario,
          valorTotal: i.quantidade * i.valorUnitario,
        })),
      },
    },
  });

  revalidatePath(`/obras/${obraId}/materiais`);
  redirect(`/obras/${obraId}/materiais`);
}

export async function atualizarStatusPedido(
  pedidoId: string,
  obraId: string,
  status: (typeof STATUS_PEDIDO)[number]
) {
  await verifySession();
  await prisma.pedidoMaterial.update({
    where: { id: pedidoId },
    data: {
      status,
      dataEntregaReal: status === "ENTREGUE" ? new Date() : undefined,
    },
  });
  revalidatePath(`/obras/${obraId}/materiais`);
}

export async function deletePedido(pedidoId: string, obraId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.pedidoMaterial.delete({ where: { id: pedidoId } });
  revalidatePath(`/obras/${obraId}/materiais`);
}
