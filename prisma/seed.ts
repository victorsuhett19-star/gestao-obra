import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const empresa = await prisma.empresa.upsert({
    where: { id: "empresa-padrao" },
    update: {},
    create: { id: "empresa-padrao", nome: "Minha Empresa" },
  });

  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@empresa.com";
  const senha = process.env.SEED_ADMIN_PASSWORD ?? "troque-esta-senha";
  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: "Administrador",
      email,
      senhaHash,
      papel: "ADMIN",
    },
  });

  console.log(`Usuário admin pronto -> e-mail: ${email} / senha: ${senha}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
