/*
  Warnings:

  - You are about to drop the column `maoDeObraPresente` on the `DiarioObra` table. All the data in the column will be lost.
  - You are about to drop the column `ocorrencias` on the `DiarioObra` table. All the data in the column will be lost.
  - You are about to drop the column `clienteContato` on the `Obra` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT,
    "telefone" TEXT,
    "fotoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Colaborador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObjetivoDiario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ObjetivoDiario_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiarioColaborador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "diarioId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    CONSTRAINT "DiarioColaborador_diarioId_fkey" FOREIGN KEY ("diarioId") REFERENCES "DiarioObra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiarioColaborador_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiarioObra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clima" TEXT,
    "terceirizados" TEXT,
    "atividadesRealizadas" TEXT NOT NULL,
    "necessidades" TEXT,
    "criadoPorId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiarioObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DiarioObra_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DiarioObra" ("atividadesRealizadas", "clima", "criadoEm", "criadoPorId", "data", "id", "obraId") SELECT "atividadesRealizadas", "clima", "criadoEm", "criadoPorId", "data", "id", "obraId" FROM "DiarioObra";
DROP TABLE "DiarioObra";
ALTER TABLE "new_DiarioObra" RENAME TO "DiarioObra";
CREATE TABLE "new_Obra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "clienteNome" TEXT,
    "clienteTelefone" TEXT,
    "clienteEmail" TEXT,
    "clienteCpfCnpj" TEXT,
    "descricao" TEXT,
    "condicoesPagamento" TEXT,
    "prazoExecucaoDias" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PLANEJAMENTO',
    "dataInicioPrevista" DATETIME,
    "dataFimPrevista" DATETIME,
    "dataInicioReal" DATETIME,
    "dataFimReal" DATETIME,
    "criadoPorId" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Obra_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Obra_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Obra" ("clienteNome", "criadoEm", "criadoPorId", "dataFimPrevista", "dataFimReal", "dataInicioPrevista", "dataInicioReal", "empresaId", "endereco", "id", "nome", "status") SELECT "clienteNome", "criadoEm", "criadoPorId", "dataFimPrevista", "dataFimReal", "dataInicioPrevista", "dataInicioReal", "empresaId", "endereco", "id", "nome", "status" FROM "Obra";
DROP TABLE "Obra";
ALTER TABLE "new_Obra" RENAME TO "Obra";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DiarioColaborador_diarioId_colaboradorId_key" ON "DiarioColaborador"("diarioId", "colaboradorId");
