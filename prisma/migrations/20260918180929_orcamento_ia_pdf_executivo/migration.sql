-- AlterTable
ALTER TABLE "OrcamentoIA" ADD COLUMN     "arquivoExecutivoId" TEXT;

-- AddForeignKey
ALTER TABLE "OrcamentoIA" ADD CONSTRAINT "OrcamentoIA_arquivoExecutivoId_fkey" FOREIGN KEY ("arquivoExecutivoId") REFERENCES "Arquivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
