// Script único: aplica o padrão de módulos (tudo liberado, exceto os
// sensíveis) para logins que existiam antes do recurso de permissões por
// módulo — hoje com modulosVisiveis = null (acesso total "por herança").
// Admin nunca precisa disso (sempre vê tudo, independente do campo).
// Rodar com: npx tsx prisma/ajustar-modulos-legado.ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { modulosPadrao } from "../src/lib/modulos";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const padrao = modulosPadrao().join(",");

  const usuarios = await prisma.usuario.findMany({
    where: { papel: { not: "ADMIN" }, modulosVisiveis: null },
  });

  for (const u of usuarios) {
    await prisma.usuario.update({
      where: { id: u.id },
      data: { modulosVisiveis: padrao },
    });
    console.log(`Ajustado: ${u.nome} (${u.email}) -> ${padrao}`);
  }

  console.log(`\n${usuarios.length} usuário(s) ajustado(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
