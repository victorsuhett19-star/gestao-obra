import "server-only";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { podeVerModulo, type ModuloKey } from "@/lib/modulos";

export { MODULOS, MODULOS_SENSIVEIS, modulosPadrao, podeVerModulo } from "@/lib/modulos";
export type { ModuloKey } from "@/lib/modulos";

/**
 * Use no topo de um layout.tsx de módulo (server component) para bloquear o
 * acesso de quem não tem permissão — mesmo digitando a URL direto.
 */
export async function requireModulo(modulo: ModuloKey) {
  const user = await getUser();
  if (!podeVerModulo(user, modulo)) {
    redirect("/dashboard");
  }
  return user;
}
