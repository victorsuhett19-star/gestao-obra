"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession, getUser } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { formatDateOnly } from "@/lib/labels";

/** Troca os placeholders {{obra}}, {{cliente}}, {{endereco}} e {{data}} no
 * corpo do template pelos dados reais da obra, no momento da geração. */
function preencherPlaceholders(
  corpo: string,
  obra: { nome: string; clienteNome: string | null; endereco: string | null }
) {
  return corpo
    .replaceAll("{{obra}}", obra.nome)
    .replaceAll("{{cliente}}", obra.clienteNome ?? "—")
    .replaceAll("{{endereco}}", obra.endereco ?? "—")
    .replaceAll("{{data}}", formatDateOnly(new Date()));
}

export async function salvarTemplate(_obraId: string, formData: FormData) {
  const user = await verifySession().then(() => getUser());
  if (!user) return;

  const templateId = formData.get("templateId");
  const nome = formData.get("nome");
  const corpo = formData.get("corpo");
  if (typeof nome !== "string" || !nome.trim()) return;
  if (typeof corpo !== "string" || !corpo.trim()) return;

  const empresaAtivaId = (await getEmpresaAtivaId()) ?? user.empresaId;

  if (typeof templateId === "string" && templateId) {
    await prisma.relatorioTemplate.update({
      where: { id: templateId },
      data: { nome: nome.trim(), corpo: corpo.trim() },
    });
  } else {
    await prisma.relatorioTemplate.create({
      data: { empresaId: empresaAtivaId, nome: nome.trim(), corpo: corpo.trim() },
    });
  }

  revalidatePath(`/obras/${_obraId}/relatorio`);
  revalidatePath(`/projetos/${_obraId}/relatorio`);
}

export async function excluirTemplate(templateId: string, obraId: string) {
  await verifySession();
  await prisma.relatorioTemplate.delete({ where: { id: templateId } });
  revalidatePath(`/obras/${obraId}/relatorio`);
  revalidatePath(`/projetos/${obraId}/relatorio`);
}

export async function gerarRelatorio(obraId: string, formData: FormData) {
  const user = await verifySession().then(() => getUser());
  if (!user) return;

  const templateId = formData.get("templateId");
  if (typeof templateId !== "string" || !templateId) return;

  const [obra, template] = await Promise.all([
    prisma.obra.findUnique({ where: { id: obraId } }),
    prisma.relatorioTemplate.findUnique({ where: { id: templateId } }),
  ]);
  if (!obra || !template) return;

  await prisma.relatorioObra.create({
    data: {
      obraId,
      templateId: template.id,
      templateNome: template.nome,
      corpo: preencherPlaceholders(template.corpo, obra),
      criadoPorId: user.id,
    },
  });

  revalidatePath(`/obras/${obraId}/relatorio`);
  revalidatePath(`/projetos/${obraId}/relatorio`);
}

export async function excluirRelatorio(relatorioId: string, obraId: string) {
  await verifySession();
  await prisma.relatorioObra.delete({ where: { id: relatorioId } });
  revalidatePath(`/obras/${obraId}/relatorio`);
  revalidatePath(`/projetos/${obraId}/relatorio`);
}
