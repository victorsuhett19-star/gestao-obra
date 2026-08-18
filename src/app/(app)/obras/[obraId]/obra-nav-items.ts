// Sub-navegação da obra. Cada fase acrescenta uma aba conforme as páginas
// (cronograma, orçamento, materiais, fotos, diário) vão sendo construídas.
export function obraNavItems(obraId: string): { href: string; label: string }[] {
  return [
    { href: `/obras/${obraId}`, label: "Visão geral" },
    { href: `/obras/${obraId}/cronograma`, label: "Cronograma" },
  ];
}
