import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionPayload } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Data Access Layer: centraliza a verificação de sessão. Chame verifySession()
// (ou getUser()) o mais perto possível dos dados/ações que precisam de auth,
// nunca confie apenas em esconder UI no client.
export const verifySession = cache(async () => {
  const session = await getSessionPayload();

  if (!session?.userId) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});

export const getUser = cache(async () => {
  const session = await getSessionPayload();
  if (!session?.userId) return null;

  try {
    const user = await prisma.usuario.findUnique({
      where: { id: session.userId, ativo: true },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        empresaId: true,
      },
    });
    return user;
  } catch {
    return null;
  }
});
