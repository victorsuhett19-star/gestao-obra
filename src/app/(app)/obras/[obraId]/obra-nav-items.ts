// Sub-navegação da obra. Cada fase acrescenta uma aba conforme as páginas
// (cronograma, orçamento, materiais, fotos, diário) vão sendo construídas.
export function obraNavItems(obraId: string): { href: string; label: string }[] {
  return [
    { href: `/obras/${obraId}`, label: "Visão geral" },
    { href: `/obras/${obraId}/cronograma`, label: "Cronograma" },
    { href: `/obras/${obraId}/orcamento`, label: "Orçamento" },
    { href: `/obras/${obraId}/financeiro`, label: "Financeiro" },
    { href: `/obras/${obraId}/materiais`, label: "Materiais" },
    { href: `/obras/${obraId}/diario`, label: "Diário" },
  ];
}
