-- CreateTable
CREATE TABLE "RegistroMontagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "dataChegada" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'FILA',
    "valorTotal" REAL NOT NULL DEFAULT 0,
    "montadorId" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroMontagem_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RegistroMontagem_montadorId_fkey" FOREIGN KEY ("montadorId") REFERENCES "Colaborador" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AmbienteMontagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registroId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numeroPedido" TEXT,
    "notaFiscal" TEXT,
    "qtdVolumes" INTEGER,
    "valor" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "AmbienteMontagem_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroMontagem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemExtraMontagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registroId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "recebido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ItemExtraMontagem_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroMontagem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FaltaFabricaMontagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registroId" TEXT NOT NULL,
    "numeroPedido" TEXT,
    "numeroVolume" TEXT,
    "recebido" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FaltaFabricaMontagem_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroMontagem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VistoriaFinal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "dataVistoria" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsavelId" TEXT,
    "observacoesCliente" TEXT,
    "assinadoResponsavelEm" DATETIME,
    "assinadoClienteEm" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VistoriaFinal_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VistoriaFinal_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemVistoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vistoriaId" TEXT NOT NULL,
    "ambiente" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    CONSTRAINT "ItemVistoria_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "VistoriaFinal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
