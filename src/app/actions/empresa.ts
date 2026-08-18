"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireRole, getUser } from "@/lib/dal";

const COOKIE_EMPRESA_ATIVA = "empresaAtiva";

export async function trocarEmpresa(formData: FormData) {
  const empresaId = formData.get("empresaId") as string;
  if (!empresaId) return;

  const user = await getUser();
  if (!user) return;

  const temAcesso =
    empresaId === user.empresaId ||
    (await prisma.usuarioEmpresa.findUnique({
      where: { usuarioId_empresaId: { usuarioId: user.id, empresaId } },
    }));

  if (!temAcesso) return;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_EMPRESA_ATIVA, empresaId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}

export async function criarEmpresa(formData: FormData) {
  const user = await requireRole(["ADMIN"]);
  const nome = formData.get("nome") as string;
  if (!nome?.trim()) return;

  const empresa = await prisma.empresa.create({ data: { nome: nome.trim() } });
  await prisma.usuarioEmpresa.create({
    data: { usuarioId: user.id, empresaId: empresa.id },
  });

  revalidatePath("/empresas");
}

export async function concederAcesso(empresaId: string, formData: FormData) {
  await requireRole(["ADMIN"]);
  const usuarioId = formData.get("usuarioId") as string;
  if (!usuarioId) return;

  await prisma.usuarioEmpresa.upsert({
    where: { usuarioId_empresaId: { usuarioId, empresaId } },
    update: {},
    create: { usuarioId, empresaId },
  });

  revalidatePath("/empresas");
}

export async function revogarAcesso(usuarioEmpresaId: string) {
  await requireRole(["ADMIN"]);
  await prisma.usuarioEmpresa.delete({ where: { id: usuarioEmpresaId } });
  revalidatePath("/empresas");
}
