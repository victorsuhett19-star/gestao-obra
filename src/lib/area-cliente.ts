import { prisma } from "@/lib/prisma";
import { somarPorCategoria, categoriasOrdenadas } from "@/lib/labels";
import type { DonutSegment } from "@/app/(app)/financeiro/donut-chart";

const PALETA = ["#2563eb", "#b45309", "#7c3aed", "#0891b2", "#dc2626", "#16a34a", "#ca8a04", "#64748b"];

export async function carregarAreaCliente(obraId: string) {
  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      trades: true,
      etapasProjeto: { select: { status: true } },
      lancamentosCliente: { orderBy: { data: "desc" } },
    },
  });
  if (!obra) return null;

  const lanc = obra.lancamentosCliente;
  const custo = lanc.filter((l) => l.tipo === "CUSTO").reduce((a, l) => a + l.valor, 0);
  const pago = lanc.filter((l) => l.tipo === "PAGAMENTO").reduce((a, l) => a + l.valor, 0);

  const grupos = new Map<string, { label: string; valor: number }>();
  for (const l of lanc) if (l.tipo === "CUSTO") somarPorCategoria(grupos, l.categoria, l.valor);
  const segments: DonutSegment[] = categoriasOrdenadas(grupos).map(([label, valor], i) => ({
    key: label,
    label,
    valor,
    cor: PALETA[i % PALETA.length],
  }));

  const totalEtapas = obra.etapasProjeto.length;
  const concluidas = obra.etapasProjeto.filter((e) => e.status === "CONCLUIDA").length;
  const progresso = totalEtapas > 0 ? Math.round((concluidas / totalEtapas) * 100) : 0;

  return { obra, lanc, custo, pago, saldo: custo - pago, segments, progresso, totalEtapas };
}
