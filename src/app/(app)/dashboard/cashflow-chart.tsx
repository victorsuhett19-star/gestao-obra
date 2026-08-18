import { formatBRL } from "@/lib/labels";

export type MesFluxo = { label: string; saldo: number };

// Barras simples em CSS puro (sem dependências) — altura relativa ao maior
// valor absoluto do período, cor por sinal (positivo/negativo).
export function CashflowChart({ meses }: { meses: MesFluxo[] }) {
  const maiorAbs = Math.max(1, ...meses.map((m) => Math.abs(m.saldo)));

  return (
    <div className="flex items-end justify-between gap-2" style={{ height: 96 }}>
      {meses.map((m) => {
        const alturaPct = Math.max(6, (Math.abs(m.saldo) / maiorAbs) * 100);
        const ultimo = m === meses[meses.length - 1];
        return (
          <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              title={formatBRL(m.saldo)}
              className={`w-full rounded-md transition-all ${
                ultimo
                  ? "bg-emerald-800"
                  : m.saldo >= 0
                    ? "bg-emerald-200"
                    : "bg-red-200"
              }`}
              style={{ height: `${alturaPct}%` }}
            />
            <span
              className={`text-[11px] font-medium uppercase ${ultimo ? "text-emerald-800" : "text-slate-400"}`}
            >
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
