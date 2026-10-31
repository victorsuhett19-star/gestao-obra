-- CreateEnum
CREATE TYPE "TipoLancamentoCliente" AS ENUM ('CUSTO', 'PAGAMENTO');

-- CreateTable
CREATE TABLE "LancamentoCliente" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "tipo" "TipoLancamentoCliente" NOT NULL DEFAULT 'CUSTO',
    "categoria" TEXT,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LancamentoCliente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LancamentoCliente" ADD CONSTRAINT "LancamentoCliente_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
