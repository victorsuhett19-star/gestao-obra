"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { UsuarioFormSchema, type UsuarioFormState } from "@/lib/definitions";
import { MODULOS, type ModuloKey } from "@/lib/permissoes";

export async function saveUsuario(
  _state: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  await requireRole(["ADMIN"]);

  const usuarioId = formData.get("usuarioId");
  const isEdicao = typeof usuarioId === "string" && usuarioId.length > 0;

  const validatedFields = UsuarioFormSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    papel: formData.get("papel"),
    senha: formData.get("senha"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { nome, email, papel, senha } = validatedFields.data;

  if (!isEdicao && !senha) {
    return { errors: { senha: ["Informe uma senha para o novo usuário."] } };
  }
  if (senha && senha.length < 6) {
    return { errors: { senha: ["A senha precisa ter ao menos 6 caracteres."] } };
  }

  const emailEmUso = await prisma.usuario.findUnique({ where: { email } });
  if (emailEmUso && emailEmUso.id !== usuarioId) {
    return { errors: { email: ["Já existe um usuário com este e-mail."] } };
  }

  // Admin sempre vê tudo (modulosVisiveis fica null e é ignorado). Para os
  // demais papéis, salva exatamente o que foi marcado no formulário — mesmo
  // que fique uma lista vazia (usuário sem acesso a nenhum módulo além do
  // dashboard, até o admin liberar algo).
  const chavesValidas = new Set(MODULOS.map((m) => m.key));
  const modulosMarcados = formData
    .getAll("modulos")
    .filter((v): v is ModuloKey => typeof v === "string" && chavesValidas.has(v as ModuloKey));
  const modulosVisiveis = papel === "ADMIN" ? null : modulosMarcados.join(",");

  if (isEdicao) {
    await prisma.usuario.update({
      where: { id: usuarioId as string },
      data: {
        nome,
        email,
        papel,
        modulosVisiveis,
        ...(senha ? { senhaHash: await bcrypt.hash(senha, 10) } : {}),
      },
    });
  } else {
    const empresaAtivaId = await getEmpresaAtivaId();
    if (!empresaAtivaId) {
      return { message: "Sessão expirada. Faça login novamente." };
    }
    await prisma.usuario.create({
      data: {
        nome,
        email,
        papel,
        modulosVisiveis,
        senhaHash: await bcrypt.hash(senha as string, 10),
        empresaId: empresaAtivaId,
      },
    });
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function alternarAtivoUsuario(usuarioId: string) {
  await requireRole(["ADMIN"]);
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario) return;

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { ativo: !usuario.ativo },
  });
  revalidatePath("/usuarios");
}
