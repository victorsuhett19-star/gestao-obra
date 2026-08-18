import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Sessão separada da equipe interna (src/lib/session.ts) — cookie próprio,
// para o portal do cliente (/portal). Usa a mesma SESSION_SECRET (não há
// necessidade de outra chave, o payload já diz de qual "mundo" é a sessão).
const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET não está definido no .env");
}
const encodedKey = new TextEncoder().encode(secretKey);

const CLIENT_SESSION_COOKIE = "clientSession";
const CLIENT_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

export type ClientSessionPayload = {
  clienteId: string;
  expiresAt: string;
};

async function encrypt(payload: ClientSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<ClientSessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as ClientSessionPayload;
  } catch {
    return null;
  }
}

export async function createClientSession(clienteId: string) {
  const expiresAt = new Date(Date.now() + CLIENT_SESSION_DURATION_MS);
  const session = await encrypt({
    clienteId,
    expiresAt: expiresAt.toISOString(),
  });
  const cookieStore = await cookies();

  cookieStore.set(CLIENT_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteClientSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_SESSION_COOKIE);
}

export async function getClientSessionPayload(): Promise<ClientSessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  return decrypt(cookie);
}
