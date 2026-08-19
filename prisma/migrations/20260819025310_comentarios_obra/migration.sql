-- CreateTable
CREATE TABLE "ComentarioObra" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "autorUsuarioId" TEXT,
    "autorClienteId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComentarioObra_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComentarioObra" ADD CONSTRAINT "ComentarioObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioObra" ADD CONSTRAINT "ComentarioObra_autorUsuarioId_fkey" FOREIGN KEY ("autorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioObra" ADD CONSTRAINT "ComentarioObra_autorClienteId_fkey" FOREIGN KEY ("autorClienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
