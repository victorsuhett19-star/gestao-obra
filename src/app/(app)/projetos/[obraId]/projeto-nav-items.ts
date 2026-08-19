// Sub-navegação do Projeto — mesma ideia da navegação de Obras, mas com
// tópicos voltados ao acompanhamento do projeto: Visão geral (fluxo de
// entrega), Agenda, Orçamento, Financeiro (todo gasto do projeto) e o
// Dashboard financeiro desse projeto específico.
export function projetoNavItems(obraId: string): { href: string; label: string }[] {
  return [
    { href: `/projetos/${obraId}`, label: "Visão geral" },
    { href: `/projetos/${obraId}/tarefas`, label: "Tarefas" },
    { href: `/projetos/${obraId}/agenda`, label: "Agenda" },
    { href: `/projetos/${obraId}/orcamento`, label: "Orçamento" },
    { href: `/projetos/${obraId}/financeiro`, label: "Financeiro" },
    { href: `/projetos/${obraId}/dashboard`, label: "Dashboard" },
  ];
}
