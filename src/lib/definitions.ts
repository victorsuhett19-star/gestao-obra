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
