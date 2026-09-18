-- CreateEnum
CREATE TYPE "TipoClienteOrcamento" AS ENUM ('METRAGEM_COMUM', 'CLIENTE_RECORRENTE', 'CLIENTE_RESIDENCIAL', 'CLIENTE_COMERCIAL');

-- CreateTable
CREATE TABLE "TipoMaterialOrcamento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valorM2" DOUBLE PRECISION NOT NULL,
    "ferragemPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "complexidadePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipoMaterialOrcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrcamentoIA" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "obraId" TEXT,
    "tipoCliente" "TipoClienteOrcamento" NOT NULL DEFAULT 'METRAGEM_COMUM',
    "margemPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrcamentoIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PecaOrcamentoIA" (
    "id" TEXT NOT NULL,
    "orcamentoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "comprimento" DOUBLE PRECISION NOT NULL,
    "largura" DOUBLE PRECISION NOT NULL,
    "tipoMaterialId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PecaOrcamentoIA_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TipoMaterialOrcamento" ADD CONSTRAINT "TipoMaterialOrcamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoIA" ADD CONSTRAINT "OrcamentoIA_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoIA" ADD CONSTRAINT "OrcamentoIA_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrcamentoIA" ADD CONSTRAINT "OrcamentoIA_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PecaOrcamentoIA" ADD CONSTRAINT "PecaOrcamentoIA_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "OrcamentoIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PecaOrcamentoIA" ADD CONSTRAINT "PecaOrcamentoIA_tipoMaterialId_fkey" FOREIGN KEY ("tipoMaterialId") REFERENCES "TipoMaterialOrcamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
