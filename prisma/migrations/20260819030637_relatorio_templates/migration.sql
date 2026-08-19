-- CreateTable
CREATE TABLE "RelatorioTemplate" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelatorioTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelatorioObra" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "templateId" TEXT,
    "templateNome" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelatorioObra_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RelatorioTemplate" ADD CONSTRAINT "RelatorioTemplate_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatorioObra" ADD CONSTRAINT "RelatorioObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatorioObra" ADD CONSTRAINT "RelatorioObra_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "RelatorioTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatorioObra" ADD CONSTRAINT "RelatorioObra_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
