import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getClientSessionPayload } from "@/lib/client-session";
import { prisma } from "@/lib/prisma";

export const verifyClientSession = cache(async () => {
  const session = await getClientSessionPayload();
  if (!session?.clienteId) {
    redirect("/portal/login");
  }
  return { isAuth: true, clienteId: session.clienteId };
});

export const getCliente = cache(async () => {
  const session = await getClientSessionPayload();
  if (!session?.clienteId) return null;

  try {
    return await prisma.cliente.findUnique({
      where: { id: session.clienteId, ativo: true },
      select: { id: true, nome: true, email: true, empresaId: true },
    });
  } catch {
    return null;
  }
});
