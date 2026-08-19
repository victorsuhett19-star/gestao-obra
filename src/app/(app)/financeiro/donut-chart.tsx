import { formatBRL } from "@/lib/labels";

export type DonutSegment = {
  key: string;
  label: string;
  valor: number;
  cor: string;
};

// Gráfico de pizza (donut) em CSS puro via conic-gradient — sem dependências
// externas, renderiza no servidor. `segments` já vem ordenado como deve
// aparecer na legenda; só entram no desenho os valores > 0.
export function DonutChart({
  titulo,
  segments,
}: {
  titulo: string;
  segments: DonutSegment[];
}) {
  const total = segments.reduce((acc, s) => acc + Math.max(s.valor, 0), 0);
  const comValor = segments.filter((s) => s.valor > 0);

  let gradient = "#e2e8f0";
  if (total > 0 && comValor.length > 0) {
    let acumulado = 0;
    const partes: string[] = [];
    for (const s of comValor) {
      const inicio = (acumulado / total) * 100;
      acumulado += s.valor;
      const fim = (acumulado / total) * 100;
      partes.push(`${s.cor} ${inicio}% ${fim}%`);
    }
    gradient = partes.join(", ");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-5">
      <p className="text-sm font-semibold text-slate-800">{titulo}</p>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div
          className="relative h-40 w-40 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-surface text-center">
            <span className="text-xs text-slate-500">Total</span>
            <span className="text-sm font-semibold text-slate-900">
              {formatBRL(total)}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col gap-1.5">
          {segments.map((s) => {
            const pct = total > 0 ? (s.valor / total) * 100 : 0;
            return (
              <div
                key={s.key}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-2 text-slate-700">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.cor }}
                  />
                  {s.label}
                </span>
                <span className="whitespace-nowrap text-slate-500">
                  {formatBRL(s.valor)}
                  <span className="ml-1 text-xs text-slate-400">
                    ({pct.toFixed(0)}%)
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
