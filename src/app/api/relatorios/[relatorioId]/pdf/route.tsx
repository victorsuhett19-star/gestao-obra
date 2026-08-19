import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/session";
import { gerarRelatorioPdfBuffer } from "@/lib/relatorio-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ relatorioId: string }> }
) {
  const { relatorioId } = await params;

  const staffSession = await getSessionPayload();
  if (!staffSession?.userId) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const relatorio = await prisma.relatorioObra.findUnique({
    where: { id: relatorioId },
  });
  if (!relatorio) {
    return new NextResponse("Relatório não encontrado", { status: 404 });
  }

  const resultado = await gerarRelatorioPdfBuffer(relatorio.obraId, relatorio.corpo);
  if (!resultado) {
    return new NextResponse("Obra não encontrada", { status: 404 });
  }

  return new NextResponse(new Uint8Array(resultado.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="relatorio-${resultado.nomeObra.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
