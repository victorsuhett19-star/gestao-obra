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
  clienteContato: z.string().trim().optional().or(z.literal("")),
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
