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

export function formatBRL(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
