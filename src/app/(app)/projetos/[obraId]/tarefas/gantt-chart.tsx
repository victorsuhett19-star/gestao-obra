import { formatDateOnly } from "@/lib/labels";

type Tarefa = {
  id: string;
  titulo: string;
  prioridade: string;
  dataInicio: Date | null;
  dataPrazo: Date | null;
  dependeDe: { dependeDe: { titulo: string } }[];
};

const CORES_BARRA: Record<string, string> = {
  BAIXA: "bg-slate-400",
  NORMAL: "bg-blue-500",
  ALTA: "bg-amber-500",
  URGENTE: "bg-red-500",
};

export function GanttChart({ tarefas }: { tarefas: Tarefa[] }) {
  const comData = tarefas.filter((t) => t.dataInicio && t.dataPrazo);

  if (comData.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          Nenhuma tarefa com data de início e prazo definidos ainda — o Gantt
          precisa dessas duas datas pra desenhar a barra.
        </p>
      </div>
    );
  }

  const menorData = new Date(Math.min(...comData.map((t) => t.dataInicio!.getTime())));
  const maiorData = new Date(Math.max(...comData.map((t) => t.dataPrazo!.getTime())));
  const totalDias = Math.max(
    1,
    Math.ceil((maiorData.getTime() - menorData.getTime()) / 86400000) + 1
  );

  function offsetPct(data: Date) {
    return ((data.getTime() - menorData.getTime()) / 86400000 / totalDias) * 100;
  }
  function larguraPct(inicio: Date, fim: Date) {
    return Math.max(2, (((fim.getTime() - inicio.getTime()) / 86400000) + 1) / totalDias * 100);
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex justify-between text-xs text-slate-400">
        <span>{formatDateOnly(menorData)}</span>
        <span>{formatDateOnly(maiorData)}</span>
      </div>
      <div className="flex min-w-[600px] flex-col gap-3">
        {comData.map((t) => (
          <div key={t.id} className="flex items-center gap-3">
            <p className="w-48 shrink-0 truncate text-sm text-slate-700" title={t.titulo}>
              {t.titulo}
            </p>
            <div className="relative h-5 flex-1 rounded bg-slate-50">
              <div
                title={`${formatDateOnly(t.dataInicio!)} → ${formatDateOnly(t.dataPrazo!)}`}
                className={`absolute top-0 h-5 rounded ${CORES_BARRA[t.prioridade]}`}
                style={{
                  left: `${offsetPct(t.dataInicio!)}%`,
                  width: `${larguraPct(t.dataInicio!, t.dataPrazo!)}%`,
                }}
              />
            </div>
            {t.dependeDe.length > 0 && (
              <span
                className="w-6 shrink-0 text-right text-xs text-slate-400"
                title={`Depende de: ${t.dependeDe.map((d) => d.dependeDe.titulo).join(", ")}`}
              >
                🔗{t.dependeDe.length}
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-slate-400">
        Cor da barra = prioridade. 🔗 = quantas tarefas ela depende (a data já
        vem recalculada automaticamente com base nelas).
      </p>
    </div>
  );
}
