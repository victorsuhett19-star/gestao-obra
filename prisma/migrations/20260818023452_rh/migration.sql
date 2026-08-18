-- CreateTable
CREATE TABLE "RegistroPonto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'TRABALHO',
    "horaEntrada" TEXT,
    "horaSaida" TEXT,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroPonto_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FolgaFerias" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'FOLGA',
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SOLICITADA',
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FolgaFerias_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FolhaPagamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "mesReferencia" TEXT NOT NULL,
    "salarioBase" REAL NOT NULL,
    "descontos" REAL NOT NULL DEFAULT 0,
    "valorLiquido" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "pagoEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FolhaPagamento_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentoColaborador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "colaboradorId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentoColaborador_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistroPonto_colaboradorId_data_key" ON "RegistroPonto"("colaboradorId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "FolhaPagamento_colaboradorId_mesReferencia_key" ON "FolhaPagamento"("colaboradorId", "mesReferencia");
