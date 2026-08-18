import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Armazenamento local em dev (public/uploads), servido estaticamente pelo
// Next.js. Em produção isso precisa migrar para um storage em nuvem (Vercel
// Blob, Supabase Storage etc) — o filesystem do Vercel é efêmero.
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeExt(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  const permitido = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  return permitido.includes(ext) ? ext : ".jpg";
}

/** Salva um File enviado via FormData em public/uploads e retorna a URL pública (/uploads/arquivo.ext). */
export async function salvarArquivo(file: File): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true });
  const nomeArquivo = `${randomUUID()}${sanitizeExt(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOADS_DIR, nomeArquivo), buffer);
  return `/uploads/${nomeArquivo}`;
}
