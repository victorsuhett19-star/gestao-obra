-- CreateTable
CREATE TABLE "NotaObra" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaObra_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotaObra" ADD CONSTRAINT "NotaObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaObra" ADD CONSTRAINT "NotaObra_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
