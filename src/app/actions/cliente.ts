"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getCliente, verifyClientSession } from "@/lib/client-dal";
import {
  createClientSession,
  deleteClientSession,
} from "@/lib/client-session";
import { salvarArquivo, salvarDataUrl } from "@/lib/uploads";
import {
  ClienteFormSchema,
  ClienteLoginFormSchema,
  type ClienteFormState,
  type ClienteLoginFormState,
} from "@/lib/definitions";

// --- Admin: criar/atualizar o acesso do cliente a um projeto -------------

export async function criarAcessoCliente(
  obraId: string,
  _state: ClienteFormState,
  formData: FormData
): Promise<ClienteFormState> {
  await requireRole(["ADMIN", "GESTOR"]);

  const validatedFields = ClienteFormSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    senha: formData.get("senha"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  const { nome, email, telefone, senha } = validatedFields.data;

  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra) return { message: "Projeto não encontrado." };

  const existente = await prisma.cliente.findUnique({ where: { email } });
  if (existente && existente.empresaId !== obra.empresaId) {
    return { errors: { email: ["Já existe um cliente com este e-mail."] } };
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const cliente = existente
    ? await prisma.cliente.update({
        where: { id: existente.id },
        data: { nome, telefone: telefone || null, senhaHash },
      })
    : await prisma.cliente.create({
        data: {
          empresaId: obra.empresaId,
          nome,
          email,
          telefone: telefone || null,
          senhaHash,
        },
      });

  await prisma.obra.update({
    where: { id: obraId },
    data: { clienteAcessoId: cliente.id },
  });

  revalidatePath(`/projetos/${obraId}`);
}

export async function removerAcessoCliente(obraId: string) {
  await requireRole(["ADMIN", "GESTOR"]);
  await prisma.obra.update({
    where: { id: obraId },
    data: { clienteAcessoId: null },
  });
  revalidatePath(`/projetos/${obraId}`);
  revalidatePath(`/obras/${obraId}`);
}

// --- Cliente: login/logout -------------------------------------------------

export async function loginCliente(
  _state: ClienteLoginFormState,
  formData: FormData
): Promise<ClienteLoginFormState> {
  const validatedFields = ClienteLoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }
  const { email, password } = validatedFields.data;

  const cliente = await prisma.cliente.findUnique({ where: { email } });
  if (!cliente || !cliente.ativo) {
    return { message: "E-mail ou senha inválidos." };
  }

  const senhaCorreta = await bcrypt.compare(password, cliente.senhaHash);
  if (!senhaCorreta) {
    return { message: "E-mail ou senha inválidos." };
  }

  await createClientSession(cliente.id);
  redirect("/portal");
}

export async function logoutCliente() {
  await deleteClientSession();
  redirect("/portal/login");
}

// --- Cliente: anexar arquivo e assinar etapa -------------------------------

export async function uploadAnexoCliente(obraId: string, formData: FormData) {
  await verifyClientSession();
  const cliente = await getCliente();
  if (!cliente) return;

  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra || obra.clienteAcessoId !== cliente.id) return;

  const arquivo = formData.get("arquivo") as File | null;
  if (!arquivo || arquivo.size === 0) return;
  const descricao = formData.get("descricao");

  const url = await salvarArquivo(arquivo, cliente.empresaId);
  const arquivoId = url.replace("/api/arquivos/", "");

  await prisma.anexoObra.create({
    data: {
      obraId,
      arquivoId,
      descricao: typeof descricao === "string" && descricao ? descricao : null,
      enviadoPorClienteId: cliente.id,
    },
  });

  revalidatePath(`/portal/obras/${obraId}`);
}

export async function adicionarComentarioCliente(obraId: string, formData: FormData) {
  await verifyClientSession();
  const cliente = await getCliente();
  if (!cliente) return;

  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra || obra.clienteAcessoId !== cliente.id) return;

  const texto = formData.get("texto");
  if (typeof texto !== "string" || !texto.trim()) return;

  await prisma.comentarioObra.create({
    data: {
      obraId,
      texto: texto.trim(),
      autorClienteId: cliente.id,
    },
  });

  revalidatePath(`/portal/obras/${obraId}`);
  revalidatePath(`/projetos/${obraId}`);
  revalidatePath(`/obras/${obraId}`);
}

export async function assinarEtapa(
  obraId: string,
  etapaProjetoId: string,
  assinaturaDataUrl: string
) {
  await verifyClientSession();
  const cliente = await getCliente();
  if (!cliente) return { erro: "Sessão inválida." };

  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra || obra.clienteAcessoId !== cliente.id) {
    return { erro: "Você não tem acesso a este projeto." };
  }

  const etapa = await prisma.etapaProjeto.findUnique({ where: { id: etapaProjetoId } });
  if (!etapa || etapa.obraId !== obraId) {
    return { erro: "Etapa não encontrada." };
  }
  if (!assinaturaDataUrl.startsWith("data:image/")) {
    return { erro: "Assinatura inválida." };
  }

  const arquivoId = await salvarDataUrl(
    assinaturaDataUrl,
    cliente.empresaId,
    `assinatura-${etapaProjetoId}.png`
  );

  await prisma.etapaProjeto.update({
    where: { id: etapaProjetoId },
    data: { assinaturaClienteId: arquivoId, assinadoClienteEm: new Date() },
  });

  revalidatePath(`/portal/obras/${obraId}`);
  revalidatePath(`/projetos/${obraId}`);
  return { ok: true };
}
