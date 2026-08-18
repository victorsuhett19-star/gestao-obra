import "server-only";
import { prisma } from "@/lib/prisma";

// Armazenamento de arquivos direto no Postgres (tabela Arquivo), servido via
// /api/arquivos/[id]. O filesystem do Vercel é efêmero (e somente leitura
// fora de /tmp) em produção, então gravar em disco não funciona lá — isso
// funciona igual em dev e produção, sem depender de um storage em nuvem à parte.
export async function salvarArquivo(
  file: File,
  empresaId: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const arquivo = await prisma.arquivo.create({
    data: {
      empresaId,
      nomeOriginal: file.name || "arquivo",
      mimeType: file.type || "application/octet-stream",
      tamanho: buffer.length,
      dados: buffer,
    },
  });
  return `/api/arquivos/${arquivo.id}`;
}

/** Salva um data URL (ex: assinatura desenhada em canvas, "data:image/png;base64,...") como Arquivo. */
export async function salvarDataUrl(
  dataUrl: string,
  empresaId: string,
  nome: string
): Promise<string> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Data URL inválida.");
  const [, mimeType, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  const arquivo = await prisma.arquivo.create({
    data: {
      empresaId,
      nomeOriginal: nome,
      mimeType,
      tamanho: buffer.length,
      dados: buffer,
    },
  });
  return arquivo.id;
}
