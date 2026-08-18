export type EtapaNode = {
  id: string;
  paiId: string | null;
  nome: string;
  ordem: number;
  status: string;
  percentualConcluido: number;
  dataInicioPrevista: Date | null;
  dataFimPrevista: Date | null;
  dataInicioReal: Date | null;
  dataFimReal: Date | null;
  responsavel: { id: string; nome: string } | null;
};

export type EtapaTreeNode = EtapaNode & { depth: number; filhos: EtapaTreeNode[] };

/** Monta a árvore (hierarquia pai/filho) a partir da lista plana de etapas. */
export function buildEtapaTree(etapas: EtapaNode[]): EtapaTreeNode[] {
  const porId = new Map<string, EtapaTreeNode>();
  etapas.forEach((e) => porId.set(e.id, { ...e, depth: 0, filhos: [] }));

  const raizes: EtapaTreeNode[] = [];

  porId.forEach((node) => {
    if (node.paiId && porId.has(node.paiId)) {
      const pai = porId.get(node.paiId)!;
      node.depth = pai.depth + 1;
      pai.filhos.push(node);
    } else {
      raizes.push(node);
    }
  });

  // Recalcula profundidade em cascata (caso a ordem do Map tenha processado
  // um filho antes do pai receber sua própria profundidade final).
  function setDepth(node: EtapaTreeNode, depth: number) {
    node.depth = depth;
    node.filhos.forEach((f) => setDepth(f, depth + 1));
  }
  raizes.forEach((r) => setDepth(r, 0));

  const sortByOrdem = (a: EtapaTreeNode, b: EtapaTreeNode) => a.ordem - b.ordem;
  function sortTree(nodes: EtapaTreeNode[]) {
    nodes.sort(sortByOrdem);
    nodes.forEach((n) => sortTree(n.filhos));
  }
  sortTree(raizes);

  return raizes;
}

/** Achata a árvore em uma lista ordenada (pai antes dos filhos), útil para <select>. */
export function flattenTree(nodes: EtapaTreeNode[]): EtapaTreeNode[] {
  const out: EtapaTreeNode[] = [];
  function walk(list: EtapaTreeNode[]) {
    for (const n of list) {
      out.push(n);
      walk(n.filhos);
    }
  }
  walk(nodes);
  return out;
}
