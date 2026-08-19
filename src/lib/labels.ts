export const STATUS_OBRA_LABEL: Record<string, string> = {
  PLANEJAMENTO: "Planejamento",
  EM_ANDAMENTO: "Em andamento",
  PAUSADA: "Pausada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const STATUS_OBRA_COLOR: Record<string, string> = {
  PLANEJAMENTO: "bg-slate-100 text-slate-700",
  EM_ANDAMENTO: "bg-blue-100 text-blue-700",
  PAUSADA: "bg-amber-100 text-amber-700",
  CONCLUIDA: "bg-emerald-100 text-emerald-700",
  CANCELADA: "bg-red-100 text-red-700",
};

export const TRADE_LABEL: Record<string, string> = {
  MARCENARIA: "Marcenaria",
  OBRA: "Obra",
  PROJETO: "Projeto",
  MARMORARIA: "Marmoraria",
  VIDRACARIA: "Vidraçaria",
};

// Cores usadas nos gráficos do dashboard financeiro — uma cor fixa por
// especialidade, mais duas categorias "guarda-chuva" para obras turn-key
// (mais de uma especialidade marcada) e despesas gerais da empresa (não
// ligadas a nenhuma obra específica).
export const TRADE_CHART_COLOR: Record<string, string> = {
  MARCENARIA: "#b45309",
  OBRA: "#2563eb",
  PROJETO: "#7c3aed",
  MARMORARIA: "#64748b",
  VIDRACARIA: "#06b6d4",
  MULTIPLAS: "#16a34a",
  GERAL: "#94a3b8",
};

export const TRADE_CHART_LABEL: Record<string, string> = {
  ...TRADE_LABEL,
  MULTIPLAS: "Turn-key (várias especialidades)",
  GERAL: "Despesas gerais da empresa",
};

export const STATUS_TAREFA_LABEL: Record<string, string> = {
  A_FAZER: "A Fazer",
  EM_ANDAMENTO: "Em Andamento",
  EM_REVISAO: "Em Revisão",
  CONCLUIDA: "Concluída",
};

export const STATUS_TAREFA_COLOR: Record<string, string> = {
  A_FAZER: "bg-slate-100 text-slate-600",
  EM_ANDAMENTO: "bg-blue-100 text-blue-700",
  EM_REVISAO: "bg-amber-100 text-amber-700",
  CONCLUIDA: "bg-emerald-100 text-emerald-700",
};

export const PRIORIDADE_TAREFA_LABEL: Record<string, string> = {
  BAIXA: "Baixa",
  NORMAL: "Normal",
  ALTA: "Alta",
  URGENTE: "Urgente",
};

export const PRIORIDADE_TAREFA_COLOR: Record<string, string> = {
  BAIXA: "bg-slate-100 text-slate-500",
  NORMAL: "bg-blue-50 text-blue-600",
  ALTA: "bg-amber-50 text-amber-700",
  URGENTE: "bg-red-50 text-red-700",
};

export const STATUS_ETAPA_PROJETO_LABEL: Record<string, string> = {
  AGUARDANDO: "Aguardando",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
};

export const PAPEL_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  GESTOR: "Gestor",
  ENGENHEIRO: "Engenheiro",
  MESTRE_OBRA: "Mestre de obra",
};

export const STATUS_ETAPA_LABEL: Record<string, string> = {
  NAO_INICIADA: "Não iniciada",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
  ATRASADA: "Atrasada",
};

export const STATUS_ETAPA_COLOR: Record<string, string> = {
  NAO_INICIADA: "bg-slate-100 text-slate-700",
  EM_ANDAMENTO: "bg-blue-100 text-blue-700",
  CONCLUIDA: "bg-emerald-100 text-emerald-700",
  ATRASADA: "bg-red-100 text-red-700",
};

export const CATEGORIA_ORCAMENTO_LABEL: Record<string, string> = {
  MATERIAL: "Material",
  MAO_DE_OBRA: "Mão de obra",
  SERVICO: "Serviço",
  EQUIPAMENTO: "Equipamento",
  OUTROS: "Outros",
};

export const TIPO_LANCAMENTO_LABEL: Record<string, string> = {
  CUSTO: "Custo",
  RECEITA: "Receita",
  PAGAMENTO: "Pagamento",
};

export const TIPO_LANCAMENTO_COLOR: Record<string, string> = {
  CUSTO: "bg-red-100 text-red-700",
  RECEITA: "bg-emerald-100 text-emerald-700",
  PAGAMENTO: "bg-blue-100 text-blue-700",
};

export const STATUS_PEDIDO_LABEL: Record<string, string> = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  CONFIRMADO: "Confirmado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

export const STATUS_PEDIDO_COLOR: Record<string, string> = {
  RASCUNHO: "bg-slate-100 text-slate-700",
  ENVIADO: "bg-blue-100 text-blue-700",
  CONFIRMADO: "bg-amber-100 text-amber-700",
  ENTREGUE: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export const CLIMA_LABEL: Record<string, string> = {
  ENSOLARADO: "☀️ Ensolarado",
  NUBLADO: "☁️ Nublado",
  CHUVOSO: "🌧️ Chuvoso",
  IMPRATICAVEL: "⛔ Imprático",
};

export const STATUS_CONFERENCIA_LABEL: Record<string, string> = {
  VENDA_FUTURA: "Venda futura",
  CONFERENCIA_MEDIDAS: "Conferência de medidas",
  AJUSTE_PROJETO: "Ajuste de projeto",
  CONFERENCIA_PROJETOS: "Conferência de projetos",
  DESENHO_PROJETOS: "Desenho de projetos",
  CONCLUIDO: "Concluído",
};

export const STATUS_MONTAGEM_LABEL: Record<string, string> = {
  FILA: "Fila",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDA: "Concluída",
};

export const STATUS_MONTAGEM_COLOR: Record<string, string> = {
  FILA: "bg-slate-100 text-slate-700",
  EM_ANDAMENTO: "bg-blue-100 text-blue-700",
  CONCLUIDA: "bg-emerald-100 text-emerald-700",
};

export const STATUS_ITEM_VISTORIA_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO_SEM_OCORRENCIA: "Concluído sem ocorrência",
  CONCLUIDO_COM_OCORRENCIA: "Concluído com ocorrência",
};

export const STATUS_ITEM_VISTORIA_COLOR: Record<string, string> = {
  PENDENTE: "bg-slate-100 text-slate-700",
  CONCLUIDO_SEM_OCORRENCIA: "bg-emerald-100 text-emerald-700",
  CONCLUIDO_COM_OCORRENCIA: "bg-amber-100 text-amber-700",
};

export const STATUS_ATENDIMENTO_LABEL: Record<string, string> = {
  ENTRADA_LEADS: "Entrada de leads",
  CONTATO_REALIZADO: "Contato realizado",
  PROPOSTA_ENVIADA: "Proposta enviada",
  NEGOCIACAO: "Negociação",
  GANHO: "Ganho",
  PERDIDO: "Perdido",
};

export const ORIGEM_ATENDIMENTO_LABEL: Record<string, string> = {
  LEAD: "🎯 Lead",
  CLIENTE_DE_PORTA: "🚶 Cliente de porta",
  JA_CLIENTE: "🔄 Já é cliente",
  INDICACAO: "👥 Indicação",
};

export const FAIXA_INVESTIMENTO_LABEL: Record<string, string> = {
  ATE_10K: "Até R$ 10.000",
  DE_10K_A_30K: "R$ 10.000 – R$ 30.000",
  DE_30K_A_60K: "R$ 30.000 – R$ 60.000",
  DE_60K_A_100K: "R$ 60.000 – R$ 100.000",
  ACIMA_100K: "Acima de R$ 100.000",
};

export const TIPO_EVENTO_LABEL: Record<string, string> = {
  REUNIAO: "Reunião",
  VISITA: "Visita",
  ENTREGA: "Entrega",
  OUTRO: "Outro",
};

export const TIPO_REGISTRO_PONTO_LABEL: Record<string, string> = {
  TRABALHO: "Trabalho",
  FALTA: "Falta",
  ATESTADO: "Atestado",
  FERIADO: "Feriado",
  FOLGA: "Folga",
};

export const TIPO_REGISTRO_PONTO_COLOR: Record<string, string> = {
  TRABALHO: "bg-emerald-100 text-emerald-700",
  FALTA: "bg-red-100 text-red-700",
  ATESTADO: "bg-amber-100 text-amber-700",
  FERIADO: "bg-blue-100 text-blue-700",
  FOLGA: "bg-slate-100 text-slate-700",
};

export const TIPO_FOLGA_LABEL: Record<string, string> = {
  FERIAS: "Férias",
  FOLGA: "Folga",
};

export const STATUS_FOLGA_LABEL: Record<string, string> = {
  SOLICITADA: "Solicitada",
  APROVADA: "Aprovada",
  RECUSADA: "Recusada",
};

export const STATUS_FOLGA_COLOR: Record<string, string> = {
  SOLICITADA: "bg-amber-100 text-amber-700",
  APROVADA: "bg-emerald-100 text-emerald-700",
  RECUSADA: "bg-red-100 text-red-700",
};

export const STATUS_FOLHA_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGA: "Paga",
};

export const STATUS_FOLHA_COLOR: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-700",
  PAGA: "bg-emerald-100 text-emerald-700",
};

// Formata um timestamp real (ex: criadoEm, horário de assinatura) no fuso do
// servidor. Não use para campos que vieram de um <input type="date"> puro —
// use formatDateOnly para esses (veja o comentário lá).
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

// `new Date("2026-09-01")` (o formato de um <input type="date">) é
// interpretado como meia-noite em UTC. Formatar isso no fuso local do
// servidor (ex: Brasília, UTC-3) exibe o dia ANTERIOR errado. Como a
// intenção desses campos é representar um dia de calendário sem hora, a
// leitura de volta também precisa ser em UTC — não no fuso local.
export function formatDateOnly(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

export const TIPO_CONTA_FINANCEIRA_LABEL: Record<string, string> = {
  PAGAR: "A pagar",
  RECEBER: "A receber",
};

export function formatHora(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
