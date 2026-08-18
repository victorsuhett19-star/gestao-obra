-- CreateTable
CREATE TABLE "ItemConferencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "obraId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VENDA_FUTURA',
    "responsavelId" TEXT,
    "prazo" DATETIME,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ItemConferencia_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ItemConferencia_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
