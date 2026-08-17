"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions";

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // Mensagem genérica em ambos os casos para não revelar se o e-mail existe.
  if (!usuario || !usuario.ativo) {
    return { message: "E-mail ou senha inválidos." };
  }

  const senhaConfere = await bcrypt.compare(password, usuario.senhaHash);
  if (!senhaConfere) {
    return { message: "E-mail ou senha inválidos." };
  }

  await createSession(usuario.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
