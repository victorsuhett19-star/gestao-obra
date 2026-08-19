"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, requireRole } from "@/lib/dal";
import { TarefaFormSchema, type TarefaFormState } from "@/lib/definitions";

/**
 * Recalcula dataInicio/dataPrazo de toda tarefa que tem dependência: só pode
 * começar no dia seguinte ao prazo da última dependência terminar. Roda por
 * relaxamento iterativo (várias passadas) pra propagar em cadeias de
 * dependência — a obra tem poucas tarefas, então é rápido o suficiente sem
 * precisar de ordenação topológica de verdade.
 */
async function recalcularDatas(obraId: string) {
  const tarefas = await prisma.tarefa.findMany({
    where: { obraId },
    include: { dependeDe: true },
  });
  if (tarefas.length === 0) return;

  const datas = new Map(
    tarefas.map((t) => [t.id, { inicio: t.dataInicio, prazo: t.dataPrazo }])
  );

  let mudou = true;
  let voltas = 0;
  while (mudou && voltas < tarefas.length + 1) {
    mudou = false;
    voltas++;
    for (const t of tarefas) {
      const depsIds = t.dependeDe.map((d) => d.dependeDeId);
      if (depsIds.length === 0) continue;

      const prazosDeps = depsIds
        .map((id) => datas.get(id)?.prazo)
        .filter((d): d is Date => !!d);
      if (prazosDeps.length !== depsIds.length) continue;

      const maiorPrazo = new Date(Math.max(...prazosDeps.map((d) => d.getTime())));
      const novoInicio = new Date(maiorPrazo);
      novoInicio.setUTCDate(novoInicio.getUTCDate() + 1);

      const atual = datas.get(t.id)!;
      if (!atual.inicio || atual.inicio.getTime() !== novoInicio.getTime()) {
        const novoPrazo = new Date(novoInicio);
        novoPrazo.setUTCDate(novoPrazo.getUTCDate() + Math.max(0, t.duracaoDias - 1));
        datas.set(t.id, { inicio: novoInicio, prazo: novoPrazo });
        mudou = true;
      }
    }
  }

  const paraAtualizar = tarefas.filter((t) => t.dependeDe.length > 0);
  if (paraAtualizar.length === 0) return;

  await prisma.$transaction(
    paraAtualizar.map((t) => {
      const d = datas.get(t.id)!;
      return prisma.tarefa.update({
        where: { id: t.id },
        data: { dataInicio: d.inicio, dataPrazo: d.prazo },
      });
    })
  );
}

export async function salvarTarefa(
  _state: TarefaFormState,
  formData: FormData
): Promise<TarefaFormState> {
  await verifySession();

  const tarefaId = formData.get("tarefaId");
  const isEdicao = typeof tarefaId === "string" && tarefaId.length > 0;

  const validatedFields = TarefaFormSchema.safeParse({
    obraId: formData.get("obraId"),
    titulo: formData.get("titulo"),
    categoria: formData.get("categoria"),
    status: formData.get("status"),
    prioridade: formData.get("prioridade"),
    responsavelId: formData.get("responsavelId"),
    dataInicio: formData.get("dataInicio"),
    dataPrazo: formData.get("dataPrazo"),
    duracaoDias: formData.get("duracaoDias"),
    dependencias: formData.getAll("dependencias"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const {
    obraId,
    titulo,
    categoria,
    status,
    prioridade,
    responsavelId,
    dataInicio,
    dataPrazo,
    duracaoDias,
    dependencias,
  } = validatedFields.data;

  const payload = {
    obraId,
    titulo,
    categoria: categoria || null,
    status,
    prioridade,
    responsavelId: responsavelId || null,
    dataInicio: dataInicio ? new Date(dataInicio) : null,
    dataPrazo: dataPrazo ? new Date(dataPrazo) : null,
    duracaoDias: duracaoDias ? Math.max(1, Number(duracaoDias)) : 1,
  };

  const deps = (dependencias ?? []).filter((id) => id && id !== tarefaId);

  let tarefa;
  if (isEdicao) {
    tarefa = await prisma.tarefa.update({
      where: { id: tarefaId as string },
      data: payload,
    });
    await prisma.tarefaDependencia.deleteMany({ where: { tarefaId: tarefa.id } });
  } else {
    const ultima = await prisma.tarefa.findFirst({
      where: { obraId, status: payload.status },
      orderBy: { ordem: "desc" },
    });
    tarefa = await prisma.tarefa.create({
      data: { ...payload, ordem: (ultima?.ordem ?? -1) + 1 },
    });
  }

  if (deps.length > 0) {
    await prisma.tarefaDependencia.createMany({
      data: deps.map((dependeDeId) => ({ tarefaId: tarefa.id, dependeDeId })),
      skipDuplicates: true,
    });
  }

  await recalcularDatas(obraId);

  const voltarPara = formData.get("voltarPara");
  const destino =
    typeof voltarPara === "string" && voltarPara
      ? voltarPara
      : `/projetos/${obraId}/tarefas`;

  revalidatePath(`/projetos/${obraId}/tarefas`);
  redirect(destino);
}

export async function moverTarefaStatus(
  obraId: string,
  tarefaId: string,
  novoStatus: string
) {
  await verifySession();
  await prisma.tarefa.update({
    where: { id: tarefaId },
    data: { status: novoStatus as never },
  });
  revalidatePath(`/projetos/${obraId}/tarefas`);
}

export async function excluirTarefa(tarefaId: string, obraId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.tarefa.delete({ where: { id: tarefaId } });
  await recalcularDatas(obraId);
  revalidatePath(`/projetos/${obraId}/tarefas`);
}
