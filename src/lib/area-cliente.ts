import { prisma } from "@/lib/prisma";
import { somarPorCategoria, categoriasOrdenadas } from "@/lib/labels";
import type { DonutSegment } from "@/app/(app)/financeiro/donut-chart";

const MESES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const PALETA = ["#2563eb", "#b45309", "#7c3aed", "#0891b2", "#dc2626", "#16a34a", "#ca8a04", "#64748b"];

export async function carregarAreaCliente(obraId: string) {
  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      trades: true,
      etapasProjeto: { select: { status: true } },
      lancamentosCliente: { orderBy: { data: "desc" } },
      cronograma: { orderBy: [{ dataInicio: "asc" }, { ordem: "asc" }] },
    },
  });
  if (!obra) return null;

  // A Área do cliente controla só os gastos da obra.
  const lanc = obra.lancamentosCliente.filter((l) => l.tipo === "CUSTO");
  const custo = lanc.reduce((a, l) => a + l.valor, 0);

  // Gastos por mês: 6 meses terminando no mês atual.
  const agora = new Date();
  const mesesSerie = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(agora.getFullYear(), agora.getMonth() - 5 + i, 1));
    return { ano: d.getUTCFullYear(), mes: d.getUTCMonth() };
  });
  const serieGastos = mesesSerie.map(() => 0);
  for (const l of lanc) {
    const i = mesesSerie.findIndex(
      (m) => m.ano === l.data.getUTCFullYear() && m.mes === l.data.getUTCMonth()
    );
    if (i >= 0) serieGastos[i] += l.valor;
  }
  const serieLabels = mesesSerie.map((m) => MESES_CURTO[m.mes]);
  const gastoMes = serieGastos[5];
  const gastoMesAnterior = serieGastos[4];
  const variacaoMes =
    gastoMesAnterior === 0
      ? gastoMes === 0
        ? null
        : 100
      : ((gastoMes - gastoMesAnterior) / gastoMesAnterior) * 100;

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

  return {
    obra,
    lanc,
    custo,
    segments,
    progresso,
    totalEtapas,
    serieGastos,
    serieLabels,
    gastoMes,
    variacaoMes,
  };
}
