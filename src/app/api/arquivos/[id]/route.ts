import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/session";
import { getClientSessionPayload } from "@/lib/client-session";

// Serve arquivos gravados no banco (foto de diário, anexo de projeto,
// assinatura do cliente). Exige alguma sessão válida (equipe OU cliente) —
// não é um endpoint público, mas também não faz checagem fina de "esse
// cliente pode ver esse arquivo específico" (suficiente para o MVP).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [staffSession, clientSession] = await Promise.all([
    getSessionPayload(),
    getClientSessionPayload(),
  ]);
  if (!staffSession?.userId && !clientSession?.clienteId) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const arquivo = await prisma.arquivo.findUnique({ where: { id } });
  if (!arquivo) {
    return new NextResponse("Não encontrado", { status: 404 });
  }

  return new NextResponse(new Uint8Array(arquivo.dados), {
    headers: {
      "Content-Type": arquivo.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(arquivo.nomeOriginal)}"`,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
