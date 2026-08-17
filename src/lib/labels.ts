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
