import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }).trim(),
  password: z
    .string()
    .min(1, { error: "Informe a senha." })
    .trim(),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const TRADES = [
  "MARCENARIA",
  "OBRA",
  "PROJETO",
  "MARMORARIA",
  "VIDRACARIA",
] as const;

export const STATUS_OBRA = [
  "PLANEJAMENTO",
  "EM_ANDAMENTO",
  "PAUSADA",
  "CONCLUIDA",
  "CANCELADA",
] as const;

export const ObraFormSchema = z.object({
  nome: z.string().min(2, { error: "Informe o nome da obra." }).trim(),
  endereco: z.string().trim().optional().or(z.literal("")),
  clienteNome: z.string().trim().optional().or(z.literal("")),
  clienteTelefone: z.string().trim().optional().or(z.literal("")),
  clienteEmail: z
    .email({ error: "E-mail inválido." })
    .trim()
    .optional()
    .or(z.literal("")),
  clienteCpfCnpj: z.string().trim().optional().or(z.literal("")),
  descricao: z.string().trim().optional().or(z.literal("")),
  condicoesPagamento: z.string().trim().optional().or(z.literal("")),
  prazoExecucaoDias: z.string().trim().optional().or(z.literal("")),
  status: z.enum(STATUS_OBRA, { error: "Selecione um status." }),
  dataInicioPrevista: z.string().trim().optional().or(z.literal("")),
  dataFimPrevista: z.string().trim().optional().or(z.literal("")),
  trades: z
    .array(z.enum(TRADES))
    .min(1, { error: "Selecione ao menos uma especialidade." }),
});

export type ObraFormState =
  | {
      errors?: {
        nome?: string[];
        clienteEmail?: string[];
        status?: string[];
        trades?: string[];
      };
      message?: string;
    }
  | undefined;

export const ColaboradorFormSchema = z.object({
  nome: z.string().min(2, { error: "Informe o nome do colaborador." }).trim(),
  funcao: z.string().trim().optional().or(z.literal("")),
  telefone: z.string().trim().optional().or(z.literal("")),
  fotoUrl: z
    .url({ error: "Informe uma URL válida." })
    .trim()
    .optional()
    .or(z.literal("")),
});

export type ColaboradorFormState =
  | {
      errors?: {
        nome?: string[];
        fotoUrl?: string[];
      };
      message?: string;
    }
  | undefined;

export const STATUS_ETAPA = [
  "NAO_INICIADA",
  "EM_ANDAMENTO",
  "CONCLUIDA",
  "ATRASADA",
] as const;

export const EtapaFormSchema = z.object({
  obraId: z.string().min(1),
  paiId: z.string().trim().optional().or(z.literal("")),
  nome: z.string().min(2, { error: "Informe o nome da etapa." }).trim(),
  status: z.enum(STATUS_ETAPA, { error: "Selecione um status." }),
  percentualConcluido: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  dataInicioPrevista: z.string().trim().optional().or(z.literal("")),
  dataFimPrevista: z.string().trim().optional().or(z.literal("")),
  dataInicioReal: z.string().trim().optional().or(z.literal("")),
  dataFimReal: z.string().trim().optional().or(z.literal("")),
  responsavelId: z.string().trim().optional().or(z.literal("")),
});

export type EtapaFormState =
  | {
      errors?: {
        nome?: string[];
        status?: string[];
      };
      message?: string;
    }
  | undefined;

export const CATEGORIA_ORCAMENTO = [
  "MATERIAL",
  "MAO_DE_OBRA",
  "SERVICO",
  "EQUIPAMENTO",
  "OUTROS",
] as const;

export const ItemOrcamentoFormSchema = z.object({
  obraId: z.string().min(1),
  etapaId: z.string().trim().optional().or(z.literal("")),
  categoria: z.enum(CATEGORIA_ORCAMENTO, { error: "Selecione uma categoria." }),
  descricao: z.string().min(2, { error: "Informe a descrição." }).trim(),
  unidade: z.string().trim().optional().or(z.literal("")),
  quantidade: z
    .string()
    .trim()
    .min(1, { error: "Informe a quantidade." }),
  valorUnitario: z
    .string()
    .trim()
    .min(1, { error: "Informe o valor unitário." }),
});

export type ItemOrcamentoFormState =
  | {
      errors?: {
        descricao?: string[];
        quantidade?: string[];
        valorUnitario?: string[];
      };
      message?: string;
    }
  | undefined;

export const TIPO_LANCAMENTO = ["CUSTO", "RECEITA", "PAGAMENTO"] as const;

export const LancamentoFormSchema = z.object({
  obraId: z.string().min(1),
  itemOrcamentoId: z.string().trim().optional().or(z.literal("")),
  tipo: z.enum(TIPO_LANCAMENTO, { error: "Selecione um tipo." }),
  categoria: z.string().trim().optional().or(z.literal("")),
  descricao: z.string().min(2, { error: "Informe a descrição." }).trim(),
  valor: z.string().trim().min(1, { error: "Informe o valor." }),
  data: z.string().trim().min(1, { error: "Informe a data." }),
  formaPagamento: z.string().trim().optional().or(z.literal("")),
});

export type LancamentoFormState =
  | {
      errors?: {
        descricao?: string[];
        valor?: string[];
        data?: string[];
      };
      message?: string;
    }
  | undefined;

export const FornecedorFormSchema = z.object({
  nome: z.string().min(2, { error: "Informe o nome do fornecedor." }).trim(),
  cnpjCpf: z.string().trim().optional().or(z.literal("")),
  contato: z.string().trim().optional().or(z.literal("")),
  telefone: z.string().trim().optional().or(z.literal("")),
  email: z
    .email({ error: "E-mail inválido." })
    .trim()
    .optional()
    .or(z.literal("")),
  especialidade: z.string().trim().optional().or(z.literal("")),
});

export type FornecedorFormState =
  | { errors?: { nome?: string[]; email?: string[] }; message?: string }
  | undefined;

export const MaterialFormSchema = z.object({
  nome: z.string().min(2, { error: "Informe o nome do material." }).trim(),
  unidade: z.string().min(1, { error: "Informe a unidade." }).trim(),
  categoria: z.string().trim().optional().or(z.literal("")),
  precoReferencia: z.string().trim().optional().or(z.literal("")),
});

export type MaterialFormState =
  | { errors?: { nome?: string[]; unidade?: string[] }; message?: string }
  | undefined;

export const STATUS_PEDIDO = [
  "RASCUNHO",
  "ENVIADO",
  "CONFIRMADO",
  "ENTREGUE",
  "CANCELADO",
] as const;

export type PedidoFormState =
  | { errors?: { fornecedorId?: string[]; itens?: string[] }; message?: string }
  | undefined;

export const CLIMA = ["ENSOLARADO", "NUBLADO", "CHUVOSO", "IMPRATICAVEL"] as const;

export const DiarioFormSchema = z.object({
  obraId: z.string().min(1),
  data: z.string().trim().min(1, { error: "Informe a data." }),
  clima: z.enum(CLIMA).optional().or(z.literal("")),
  terceirizados: z.string().trim().optional().or(z.literal("")),
  atividadesRealizadas: z
    .string()
    .min(2, { error: "Descreva o que foi feito no dia." })
    .trim(),
  necessidades: z.string().trim().optional().or(z.literal("")),
  colaboradorIds: z.array(z.string()).optional(),
});

export type DiarioFormState =
  | {
      errors?: { atividadesRealizadas?: string[]; data?: string[] };
      message?: string;
    }
  | undefined;

export const ObjetivoFormSchema = z.object({
  obraId: z.string().min(1),
  descricao: z.string().min(2, { error: "Descreva o objetivo." }).trim(),
});

export type ObjetivoFormState =
  | { errors?: { descricao?: string[] }; message?: string }
  | undefined;

export const STATUS_CONFERENCIA = [
  "VENDA_FUTURA",
  "CONFERENCIA_MEDIDAS",
  "AJUSTE_PROJETO",
  "CONFERENCIA_PROJETOS",
  "DESENHO_PROJETOS",
  "CONCLUIDO",
] as const;

export const ItemConferenciaFormSchema = z.object({
  obraId: z.string().min(1),
  titulo: z.string().min(2, { error: "Informe o ambiente/item." }).trim(),
  responsavelId: z.string().trim().optional().or(z.literal("")),
  prazo: z.string().trim().optional().or(z.literal("")),
  observacoes: z.string().trim().optional().or(z.literal("")),
});

export type ItemConferenciaFormState =
  | { errors?: { titulo?: string[] }; message?: string }
  | undefined;

export const STATUS_MONTAGEM = ["FILA", "EM_ANDAMENTO", "CONCLUIDA"] as const;

export type MontagemFormState =
  | { errors?: { ambientes?: string[] }; message?: string }
  | undefined;

export const STATUS_ITEM_VISTORIA = [
  "PENDENTE",
  "CONCLUIDO_SEM_OCORRENCIA",
  "CONCLUIDO_COM_OCORRENCIA",
] as const;

export type VistoriaFormState =
  | { errors?: { itens?: string[] }; message?: string }
  | undefined;

export const STATUS_ATENDIMENTO = [
  "ENTRADA_LEADS",
  "CONTATO_REALIZADO",
  "PROPOSTA_ENVIADA",
  "NEGOCIACAO",
  "GANHO",
  "PERDIDO",
] as const;

export const ORIGEM_ATENDIMENTO = [
  "LEAD",
  "CLIENTE_DE_PORTA",
  "JA_CLIENTE",
  "INDICACAO",
] as const;

export const FAIXA_INVESTIMENTO = [
  "ATE_10K",
  "DE_10K_A_30K",
  "DE_30K_A_60K",
  "DE_60K_A_100K",
  "ACIMA_100K",
] as const;

export const AtendimentoFormSchema = z.object({
  nomeCliente: z.string().min(2, { error: "Informe o nome do cliente." }).trim(),
  telefone: z.string().trim().optional().or(z.literal("")),
  email: z
    .email({ error: "E-mail inválido." })
    .trim()
    .optional()
    .or(z.literal("")),
  clienteCpfCnpj: z.string().trim().optional().or(z.literal("")),
  ambienteDesejado: z.string().trim().optional().or(z.literal("")),
  origem: z.enum(ORIGEM_ATENDIMENTO, { error: "Selecione a origem." }),
  vendedorId: z.string().trim().optional().or(z.literal("")),
  valorEstimado: z.string().trim().optional().or(z.literal("")),
  faixaInvestimento: z.enum(FAIXA_INVESTIMENTO).optional().or(z.literal("")),
  especialidades: z.array(z.enum(TRADES)).optional(),
});

export type AtendimentoFormState =
  | { errors?: { nomeCliente?: string[]; email?: string[] }; message?: string }
  | undefined;

export const TIPO_EVENTO = ["REUNIAO", "VISITA", "ENTREGA", "OUTRO"] as const;

export const EventoFormSchema = z.object({
  titulo: z.string().min(2, { error: "Informe o título do evento." }).trim(),
  tipo: z.enum(TIPO_EVENTO, { error: "Selecione um tipo." }),
  data: z.string().min(1, { error: "Informe a data." }).trim(),
  hora: z.string().trim().optional().or(z.literal("")),
  obraId: z.string().trim().optional().or(z.literal("")),
});

export type EventoFormState =
  | { errors?: { titulo?: string[]; data?: string[] }; message?: string }
  | undefined;

export const TIPO_REGISTRO_PONTO = [
  "TRABALHO",
  "FALTA",
  "ATESTADO",
  "FERIADO",
  "FOLGA",
] as const;

export const PontoFormSchema = z.object({
  colaboradorId: z.string().min(1),
  data: z.string().min(1, { error: "Informe a data." }).trim(),
  tipo: z.enum(TIPO_REGISTRO_PONTO, { error: "Selecione um tipo." }),
  horaEntrada: z.string().trim().optional().or(z.literal("")),
  horaSaida: z.string().trim().optional().or(z.literal("")),
  observacao: z.string().trim().optional().or(z.literal("")),
});

export type PontoFormState =
  | { errors?: { data?: string[] }; message?: string }
  | undefined;

export const TIPO_FOLGA = ["FERIAS", "FOLGA"] as const;
export const STATUS_FOLGA = ["SOLICITADA", "APROVADA", "RECUSADA"] as const;

export const FolgaFormSchema = z.object({
  colaboradorId: z.string().min(1),
  tipo: z.enum(TIPO_FOLGA, { error: "Selecione um tipo." }),
  dataInicio: z.string().min(1, { error: "Informe a data de início." }).trim(),
  dataFim: z.string().min(1, { error: "Informe a data de fim." }).trim(),
  observacao: z.string().trim().optional().or(z.literal("")),
});

export type FolgaFormState =
  | { errors?: { dataInicio?: string[]; dataFim?: string[] }; message?: string }
  | undefined;

export const STATUS_FOLHA = ["PENDENTE", "PAGA"] as const;

export const FolhaFormSchema = z.object({
  colaboradorId: z.string().min(1),
  mesReferencia: z.string().min(1, { error: "Informe o mês (AAAA-MM)." }).trim(),
  salarioBase: z.string().min(1, { error: "Informe o salário base." }).trim(),
  descontos: z.string().trim().optional().or(z.literal("")),
});

export type FolhaFormState =
  | { errors?: { mesReferencia?: string[]; salarioBase?: string[] }; message?: string }
  | undefined;

export const TIPO_CONTA_FINANCEIRA = ["PAGAR", "RECEBER"] as const;

export const ContaFinanceiraFormSchema = z.object({
  tipo: z.enum(TIPO_CONTA_FINANCEIRA, { error: "Selecione um tipo." }),
  descricao: z.string().min(2, { error: "Informe a descrição." }).trim(),
  categoria: z.string().trim().optional().or(z.literal("")),
  valor: z.string().min(1, { error: "Informe o valor." }).trim(),
  dataVencimento: z.string().min(1, { error: "Informe o vencimento." }).trim(),
  fornecedorId: z.string().trim().optional().or(z.literal("")),
  obraId: z.string().trim().optional().or(z.literal("")),
});

export type ContaFinanceiraFormState =
  | {
      errors?: { descricao?: string[]; valor?: string[]; dataVencimento?: string[] };
      message?: string;
    }
  | undefined;

export const PAPEL_USUARIO = [
  "ADMIN",
  "GESTOR",
  "ENGENHEIRO",
  "MESTRE_OBRA",
] as const;

export const UsuarioFormSchema = z.object({
  nome: z.string().min(2, { error: "Informe o nome." }).trim(),
  email: z.email({ error: "Informe um e-mail válido." }).trim(),
  papel: z.enum(PAPEL_USUARIO, { error: "Selecione a função." }),
  senha: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
});

export type UsuarioFormState =
  | {
      errors?: { nome?: string[]; email?: string[]; senha?: string[] };
      message?: string;
    }
  | undefined;

// ---------------------------------------------------------------------------
// Projetos (pipeline de entrega) + Cliente (login do portal)
// ---------------------------------------------------------------------------

export const EtapaProjetoTemplateFormSchema = z.object({
  trade: z.enum(TRADES, { error: "Selecione a especialidade." }),
  nome: z.string().min(2, { error: "Informe o nome da etapa." }).trim(),
  grupo: z.string().trim().optional().or(z.literal("")),
});

export type EtapaProjetoTemplateFormState =
  | { errors?: { nome?: string[]; trade?: string[] }; message?: string }
  | undefined;

export const ClienteFormSchema = z.object({
  nome: z.string().min(2, { error: "Informe o nome do cliente." }).trim(),
  email: z.email({ error: "Informe um e-mail válido." }).trim(),
  telefone: z.string().trim().optional().or(z.literal("")),
  senha: z
    .string()
    .min(6, { error: "A senha precisa ter ao menos 6 caracteres." })
    .trim(),
});

export type ClienteFormState =
  | {
      errors?: { nome?: string[]; email?: string[]; senha?: string[] };
      message?: string;
    }
  | undefined;

export const STATUS_TAREFA = [
  "A_FAZER",
  "EM_ANDAMENTO",
  "EM_REVISAO",
  "CONCLUIDA",
] as const;

export const PRIORIDADE_TAREFA = ["BAIXA", "NORMAL", "ALTA", "URGENTE"] as const;

export const TarefaFormSchema = z.object({
  obraId: z.string().min(1),
  titulo: z.string().min(2, { error: "Informe o título da tarefa." }).trim(),
  categoria: z.string().trim().optional().or(z.literal("")),
  status: z.enum(STATUS_TAREFA, { error: "Selecione um status." }),
  prioridade: z.enum(PRIORIDADE_TAREFA, { error: "Selecione uma prioridade." }),
  responsavelId: z.string().trim().optional().or(z.literal("")),
  dataInicio: z.string().trim().optional().or(z.literal("")),
  dataPrazo: z.string().trim().optional().or(z.literal("")),
  duracaoDias: z.string().trim().optional().or(z.literal("")),
  dependencias: z.array(z.string()).optional(),
});

export type TarefaFormState =
  | { errors?: { titulo?: string[]; status?: string[] }; message?: string }
  | undefined;

export const ClienteLoginFormSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }).trim(),
  password: z.string().min(1, { error: "Informe a senha." }).trim(),
});

export type ClienteLoginFormState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;
