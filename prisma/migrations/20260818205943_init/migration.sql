-- CreateEnum
CREATE TYPE "PapelUsuario" AS ENUM ('ADMIN', 'GESTOR', 'ENGENHEIRO', 'MESTRE_OBRA');

-- CreateEnum
CREATE TYPE "StatusObra" AS ENUM ('PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "Trade" AS ENUM ('MARCENARIA', 'OBRA', 'PROJETO', 'MARMORARIA', 'VIDRACARIA');

-- CreateEnum
CREATE TYPE "StatusEtapa" AS ENUM ('NAO_INICIADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ATRASADA');

-- CreateEnum
CREATE TYPE "CategoriaOrcamento" AS ENUM ('MATERIAL', 'MAO_DE_OBRA', 'SERVICO', 'EQUIPAMENTO', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('CUSTO', 'RECEITA', 'PAGAMENTO');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('RASCUNHO', 'ENVIADO', 'CONFIRMADO', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Clima" AS ENUM ('ENSOLARADO', 'NUBLADO', 'CHUVOSO', 'IMPRATICAVEL');

-- CreateEnum
CREATE TYPE "StatusConferencia" AS ENUM ('VENDA_FUTURA', 'CONFERENCIA_MEDIDAS', 'AJUSTE_PROJETO', 'CONFERENCIA_PROJETOS', 'DESENHO_PROJETOS', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "StatusMontagem" AS ENUM ('FILA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "StatusItemVistoria" AS ENUM ('PENDENTE', 'CONCLUIDO_SEM_OCORRENCIA', 'CONCLUIDO_COM_OCORRENCIA');

-- CreateEnum
CREATE TYPE "OrigemAtendimento" AS ENUM ('LEAD', 'CLIENTE_DE_PORTA', 'JA_CLIENTE', 'INDICACAO');

-- CreateEnum
CREATE TYPE "StatusAtendimento" AS ENUM ('ENTRADA_LEADS', 'CONTATO_REALIZADO', 'PROPOSTA_ENVIADA', 'NEGOCIACAO', 'GANHO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('REUNIAO', 'VISITA', 'ENTREGA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoRegistroPonto" AS ENUM ('TRABALHO', 'FALTA', 'ATESTADO', 'FERIADO', 'FOLGA');

-- CreateEnum
CREATE TYPE "TipoFolga" AS ENUM ('FERIAS', 'FOLGA');

-- CreateEnum
CREATE TYPE "StatusFolga" AS ENUM ('SOLICITADA', 'APROVADA', 'RECUSADA');

-- CreateEnum
CREATE TYPE "StatusFolha" AS ENUM ('PENDENTE', 'PAGA');

-- CreateEnum
CREATE TYPE "TipoContaFinanceira" AS ENUM ('PAGAR', 'RECEBER');

-- CreateEnum
CREATE TYPE "StatusContaFinanceira" AS ENUM ('PENDENTE', 'PAGO');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioEmpresa" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT,
    "telefone" TEXT,
    "fotoUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "PapelUsuario" NOT NULL DEFAULT 'GESTOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modulosVisiveis" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obra" (
    "id" TEXT NOT NULL,
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
    "status" "StatusObra" NOT NULL DEFAULT 'PLANEJAMENTO',
    "dataInicioPrevista" TIMESTAMP(3),
    "dataFimPrevista" TIMESTAMP(3),
    "dataInicioReal" TIMESTAMP(3),
    "dataFimReal" TIMESTAMP(3),
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObraTrade" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "trade" "Trade" NOT NULL,

    CONSTRAINT "ObraTrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtapaTemplate" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "trade" "Trade" NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "paiId" TEXT,

    CONSTRAINT "EtapaTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etapa" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "paiId" TEXT,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "dataInicioPrevista" TIMESTAMP(3),
    "dataFimPrevista" TIMESTAMP(3),
    "dataInicioReal" TIMESTAMP(3),
    "dataFimReal" TIMESTAMP(3),
    "percentualConcluido" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusEtapa" NOT NULL DEFAULT 'NAO_INICIADA',
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemOrcamento" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "etapaId" TEXT,
    "categoria" "CategoriaOrcamento" NOT NULL DEFAULT 'OUTROS',
    "descricao" TEXT NOT NULL,
    "unidade" TEXT,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "valorUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemOrcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LancamentoFinanceiro" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "itemOrcamentoId" TEXT,
    "tipo" "TipoLancamento" NOT NULL DEFAULT 'CUSTO',
    "categoria" TEXT,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" TEXT,
    "comprovanteUrl" TEXT,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LancamentoFinanceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpjCpf" TEXT,
    "contato" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "especialidade" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "categoria" TEXT,
    "precoReferencia" DOUBLE PRECISION,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoMaterial" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'RASCUNHO',
    "dataPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataEntregaPrevista" TIMESTAMP(3),
    "dataEntregaReal" TIMESTAMP(3),
    "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PedidoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedidoMaterial" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemPedidoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "etapaId" TEXT,
    "diarioId" TEXT,
    "url" TEXT NOT NULL,
    "legenda" TEXT,
    "dataFoto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjetivoDiario" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObjetivoDiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiarioObra" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clima" "Clima",
    "terceirizados" TEXT,
    "atividadesRealizadas" TEXT NOT NULL,
    "necessidades" TEXT,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiarioObra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiarioColaborador" (
    "id" TEXT NOT NULL,
    "diarioId" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,

    CONSTRAINT "DiarioColaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemConferencia" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "status" "StatusConferencia" NOT NULL DEFAULT 'VENDA_FUTURA',
    "responsavelId" TEXT,
    "prazo" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemConferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroMontagem" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "dataChegada" TIMESTAMP(3),
    "status" "StatusMontagem" NOT NULL DEFAULT 'FILA',
    "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montadorId" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroMontagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbienteMontagem" (
    "id" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numeroPedido" TEXT,
    "notaFiscal" TEXT,
    "qtdVolumes" INTEGER,
    "valor" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "AmbienteMontagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemExtraMontagem" (
    "id" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "recebido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ItemExtraMontagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaltaFabricaMontagem" (
    "id" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "numeroPedido" TEXT,
    "numeroVolume" TEXT,
    "recebido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FaltaFabricaMontagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VistoriaFinal" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "dataVistoria" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsavelId" TEXT,
    "observacoesCliente" TEXT,
    "assinadoResponsavelEm" TIMESTAMP(3),
    "assinadoClienteEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VistoriaFinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemVistoria" (
    "id" TEXT NOT NULL,
    "vistoriaId" TEXT NOT NULL,
    "ambiente" TEXT NOT NULL,
    "status" "StatusItemVistoria" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,

    CONSTRAINT "ItemVistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atendimento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ambienteDesejado" TEXT,
    "origem" "OrigemAtendimento" NOT NULL DEFAULT 'LEAD',
    "vendedorId" TEXT,
    "status" "StatusAtendimento" NOT NULL DEFAULT 'ENTRADA_LEADS',
    "valorEstimado" DOUBLE PRECISION,
    "motivoPerda" TEXT,
    "obraId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'REUNIAO',
    "data" TIMESTAMP(3) NOT NULL,
    "obraId" TEXT,
    "criadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroPonto" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoRegistroPonto" NOT NULL DEFAULT 'TRABALHO',
    "horaEntrada" TEXT,
    "horaSaida" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroPonto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolgaFerias" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "tipo" "TipoFolga" NOT NULL DEFAULT 'FOLGA',
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" "StatusFolga" NOT NULL DEFAULT 'SOLICITADA',
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FolgaFerias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolhaPagamento" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "mesReferencia" TEXT NOT NULL,
    "salarioBase" DOUBLE PRECISION NOT NULL,
    "descontos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorLiquido" DOUBLE PRECISION NOT NULL,
    "status" "StatusFolha" NOT NULL DEFAULT 'PENDENTE',
    "pagoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FolhaPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoColaborador" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoColaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaFinanceira" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipo" "TipoContaFinanceira" NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "status" "StatusContaFinanceira" NOT NULL DEFAULT 'PENDENTE',
    "fornecedorId" TEXT,
    "obraId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContaFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresa_usuarioId_empresaId_key" ON "UsuarioEmpresa"("usuarioId", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ObraTrade_obraId_trade_key" ON "ObraTrade"("obraId", "trade");

-- CreateIndex
CREATE UNIQUE INDEX "DiarioColaborador_diarioId_colaboradorId_key" ON "DiarioColaborador"("diarioId", "colaboradorId");

-- CreateIndex
CREATE UNIQUE INDEX "Atendimento_obraId_key" ON "Atendimento"("obraId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroPonto_colaboradorId_data_key" ON "RegistroPonto"("colaboradorId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "FolhaPagamento_colaboradorId_mesReferencia_key" ON "FolhaPagamento"("colaboradorId", "mesReferencia");

-- AddForeignKey
ALTER TABLE "UsuarioEmpresa" ADD CONSTRAINT "UsuarioEmpresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEmpresa" ADD CONSTRAINT "UsuarioEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colaborador" ADD CONSTRAINT "Colaborador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Obra" ADD CONSTRAINT "Obra_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Obra" ADD CONSTRAINT "Obra_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObraTrade" ADD CONSTRAINT "ObraTrade_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaTemplate" ADD CONSTRAINT "EtapaTemplate_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtapaTemplate" ADD CONSTRAINT "EtapaTemplate_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "EtapaTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etapa" ADD CONSTRAINT "Etapa_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etapa" ADD CONSTRAINT "Etapa_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "Etapa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etapa" ADD CONSTRAINT "Etapa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrcamento" ADD CONSTRAINT "ItemOrcamento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrcamento" ADD CONSTRAINT "ItemOrcamento_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "Etapa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_itemOrcamentoId_fkey" FOREIGN KEY ("itemOrcamentoId") REFERENCES "ItemOrcamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoMaterial" ADD CONSTRAINT "PedidoMaterial_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoMaterial" ADD CONSTRAINT "PedidoMaterial_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoMaterial" ADD CONSTRAINT "PedidoMaterial_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoMaterial" ADD CONSTRAINT "ItemPedidoMaterial_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "PedidoMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoMaterial" ADD CONSTRAINT "ItemPedidoMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "Etapa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_diarioId_fkey" FOREIGN KEY ("diarioId") REFERENCES "DiarioObra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjetivoDiario" ADD CONSTRAINT "ObjetivoDiario_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiarioObra" ADD CONSTRAINT "DiarioObra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiarioObra" ADD CONSTRAINT "DiarioObra_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiarioColaborador" ADD CONSTRAINT "DiarioColaborador_diarioId_fkey" FOREIGN KEY ("diarioId") REFERENCES "DiarioObra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiarioColaborador" ADD CONSTRAINT "DiarioColaborador_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemConferencia" ADD CONSTRAINT "ItemConferencia_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemConferencia" ADD CONSTRAINT "ItemConferencia_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroMontagem" ADD CONSTRAINT "RegistroMontagem_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroMontagem" ADD CONSTRAINT "RegistroMontagem_montadorId_fkey" FOREIGN KEY ("montadorId") REFERENCES "Colaborador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbienteMontagem" ADD CONSTRAINT "AmbienteMontagem_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroMontagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemExtraMontagem" ADD CONSTRAINT "ItemExtraMontagem_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroMontagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaltaFabricaMontagem" ADD CONSTRAINT "FaltaFabricaMontagem_registroId_fkey" FOREIGN KEY ("registroId") REFERENCES "RegistroMontagem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VistoriaFinal" ADD CONSTRAINT "VistoriaFinal_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VistoriaFinal" ADD CONSTRAINT "VistoriaFinal_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVistoria" ADD CONSTRAINT "ItemVistoria_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "VistoriaFinal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroPonto" ADD CONSTRAINT "RegistroPonto_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolgaFerias" ADD CONSTRAINT "FolgaFerias_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolhaPagamento" ADD CONSTRAINT "FolhaPagamento_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoColaborador" ADD CONSTRAINT "DocumentoColaborador_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "Obra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
