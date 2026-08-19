-- CreateEnum
CREATE TYPE "StatusTarefa" AS ENUM ('A_FAZER', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "PrioridadeTarefa" AS ENUM ('BAIXA', 'NORMAL', 'ALTA', 'URGENTE');

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "cor" TEXT;

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT,
    "status" "StatusTarefa" NOT NULL DEFAULT 'A_FAZER',
    "prioridade" "PrioridadeTarefa" NOT NULL DEFAULT 'NORMAL',
    "responsavelId" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataPrazo" TIMESTAMP(3),
    "duracaoDias" INTEGER NOT NULL DEFAULT 1,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarefaDependencia" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "dependeDeId" TEXT NOT NULL,

    CONSTRAINT "TarefaDependencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TarefaDependencia_tarefaId_dependeDeId_key" ON "TarefaDependencia"("tarefaId", "dependeDeId");

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaDependencia" ADD CONSTRAINT "TarefaDependencia_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaDependencia" ADD CONSTRAINT "TarefaDependencia_dependeDeId_fkey" FOREIGN KEY ("dependeDeId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
