-- CreateTable
CREATE TABLE "NotaCliente" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "autorUsuarioId" TEXT,
    "autorClienteId" TEXT,
    "resolvida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaCliente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotaCliente" ADD CONSTRAINT "NotaCliente_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaCliente" ADD CONSTRAINT "NotaCliente_autorUsuarioId_fkey" FOREIGN KEY ("autorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaCliente" ADD CONSTRAINT "NotaCliente_autorClienteId_fkey" FOREIGN KEY ("autorClienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
