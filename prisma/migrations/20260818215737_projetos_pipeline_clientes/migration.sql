-- CreateEnum
CREATE TYPE "StatusEtapaProjeto" AS ENUM ('AGUARDANDO', 'EM_ANDAMENTO', 'CONCLUIDA');

-- AlterTable
ALTER TABLE "Obra" ADD COLUMN     "clienteAcessoId" TEXT;

-- CreateTable
CREATE TABLE "Arquivo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanho" INTEGER NOT NULL,
    "dados" BYTEA NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arquivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "senhaHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtapaProjetoTemplate" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "trade" "Trade" NOT NULL,
    "nome" TEXT NOT NULL,
    "grupo" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EtapaProjetoTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtapaProjeto" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "grupo" TEXT,
    "ordem" INTEGER NOT NULL,
    "status" "StatusEtapaProjeto" NOT NULL DEFAULT 'AGUARDANDO',
    "data" TIMESTAMP(3),
    "concluidaEm" TIMESTAMP(3),
    "assinaturaClienteId" TEXT,
    "assinadoClienteEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EtapaProjeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnexoObra" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "arquivoId" TEXT NOT NULL,
    "descricao" TEXT,
    "enviadoPorUsuarioId" TEXT,
    "enviadoPorClienteId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnexoObra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- AddForeignKey
ALTER TABLE "Obra" ADD CONSTRAINT "Obra_clienteAcessoId_fkey" FOREIGN KEY ("clienteAcessoId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arquivo" ADD CONSTRAINT "Arquivo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaProjetoTemplate" ADD CONSTRAINT "EtapaProjetoTemplate_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaProjeto" ADD CONSTRAINT "EtapaProjeto_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaProjeto" ADD CONSTRAINT "EtapaProjeto_assinaturaClienteId_fkey" FOREIGN KEY ("assinaturaClienteId") REFERENCES "Arquivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnexoObra" ADD CONSTRAINT "AnexoObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnexoObra" ADD CONSTRAINT "AnexoObra_arquivoId_fkey" FOREIGN KEY ("arquivoId") REFERENCES "Arquivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnexoObra" ADD CONSTRAINT "AnexoObra_enviadoPorUsuarioId_fkey" FOREIGN KEY ("enviadoPorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnexoObra" ADD CONSTRAINT "AnexoObra_enviadoPorClienteId_fkey" FOREIGN KEY ("enviadoPorClienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
