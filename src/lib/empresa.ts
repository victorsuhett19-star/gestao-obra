import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";

const COOKIE_EMPRESA_ATIVA = "empresaAtiva";

/**
 * Empresa "ativa" da sessão atual. Lida do cookie, mas SEMPRE validada contra
 * o banco (empresa principal do usuário ou uma concedida via UsuarioEmpresa)
 * — nunca confie no valor do cookie sozinho, ele não é assinado.
 */
export const getEmpresaAtivaId = cache(async (): Promise<string | null> => {
  const user = await getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const desejada = cookieStore.get(COOKIE_EMPRESA_ATIVA)?.value;

  if (!desejada || desejada === user.empresaId) {
    return user.empresaId;
  }

  const acesso = await prisma.usuarioEmpresa.findUnique({
    where: { usuarioId_empresaId: { usuarioId: user.id, empresaId: desejada } },
  });

  return acesso ? desejada : user.empresaId;
});

export const getEmpresasDoUsuario = cache(async () => {
  const user = await getUser();
  if (!user) return [];

  const acessos = await prisma.usuarioEmpresa.findMany({
    where: { usuarioId: user.id },
    include: { empresa: true },
  });

  const empresaPrincipal = await prisma.empresa.findUnique({
    where: { id: user.empresaId },
  });

  const todas = [empresaPrincipal, ...acessos.map((a) => a.empresa)].filter(
    (e): e is NonNullable<typeof e> => !!e
  );

  // Remove duplicatas (a empresa principal pode também ter sido concedida).
  const vistos = new Set<string>();
  return todas.filter((e) => {
    if (vistos.has(e.id)) return false;
    vistos.add(e.id);
    return true;
  });
});
