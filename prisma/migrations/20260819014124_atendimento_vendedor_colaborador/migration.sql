-- AlterTable
ALTER TABLE "Atendimento" ADD COLUMN     "vendedorColaboradorId" TEXT;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_vendedorColaboradorId_fkey" FOREIGN KEY ("vendedorColaboradorId") REFERENCES "Colaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
