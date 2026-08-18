import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";
import { decrypt as decryptClient } from "@/lib/client-session";

// Checagem OTIMISTA de sessão (via cookie), rodando antes de cada request.
// Não substitui a verificação "de verdade" feita no DAL (src/lib/dal.ts) —
// aqui é só para redirecionar cedo e evitar mostrar telas protegidas.
const publicRoutes = ["/login"];
const publicClientRoutes = ["/portal/login"];

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Portal do cliente é um "mundo" separado da equipe interna — sessão e
  // cookie próprios (clientSession), nunca compartilha login com /login.
  if (path === "/portal" || path.startsWith("/portal/")) {
    const isPublicClientRoute = publicClientRoutes.includes(path);
    const cookie = request.cookies.get("clientSession")?.value;
    const clientSession = await decryptClient(cookie);

    if (!isPublicClientRoute && !clientSession?.clienteId) {
      return NextResponse.redirect(new URL("/portal/login", request.nextUrl));
    }
    if (isPublicClientRoute && clientSession?.clienteId) {
      return NextResponse.redirect(new URL("/portal", request.nextUrl));
    }
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(path);

  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico|manifest.webmanifest|icon.png|icon.svg).*)",
  ],
};
