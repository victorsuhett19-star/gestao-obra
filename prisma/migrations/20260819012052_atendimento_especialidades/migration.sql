-- CreateEnum
CREATE TYPE "FaixaInvestimento" AS ENUM ('ATE_10K', 'DE_10K_A_30K', 'DE_30K_A_60K', 'DE_60K_A_100K', 'ACIMA_100K');

-- AlterTable
ALTER TABLE "Atendimento" ADD COLUMN     "clienteCpfCnpj" TEXT,
ADD COLUMN     "faixaInvestimento" "FaixaInvestimento";

-- CreateTable
CREATE TABLE "AtendimentoTrade" (
    "id" TEXT NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "trade" "Trade" NOT NULL,

    CONSTRAINT "AtendimentoTrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AtendimentoTrade_atendimentoId_trade_key" ON "AtendimentoTrade"("atendimentoId", "trade");

-- AddForeignKey
ALTER TABLE "AtendimentoTrade" ADD CONSTRAINT "AtendimentoTrade_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
