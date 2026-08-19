import Link from "next/link";
import { feriadosDoAno, feriadoNoDia } from "@/lib/feriados";

const NOMES_MES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Evento = { id: string; titulo: string; data: Date; cor: string | null };
type Tarefa = { id: string; titulo: string; dataPrazo: Date | null };

export function CalendarioView({
  obraId,
  ano,
  mes,
  eventos,
  tarefas,
}: {
  obraId: string;
  ano: number;
  mes: number;
  eventos: Evento[];
  tarefas: Tarefa[];
}) {
  const feriados = feriadosDoAno(ano);
  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay();
  const totalDias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();

  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const mesAnterior = mes === 0 ? { ano: ano - 1, mes: 11 } : { ano, mes: mes - 1 };
  const mesSeguinte = mes === 11 ? { ano: ano + 1, mes: 0 } : { ano, mes: mes + 1 };

  function eventosNoDia(dia: number) {
    return eventos.filter(
      (e) =>
        e.data.getUTCFullYear() === ano &&
        e.data.getUTCMonth() === mes &&
        e.data.getUTCDate() === dia
    );
  }
  function tarefasNoDia(dia: number) {
    return tarefas.filter(
      (t) =>
        t.dataPrazo &&
        t.dataPrazo.getUTCFullYear() === ano &&
        t.dataPrazo.getUTCMonth() === mes &&
        t.dataPrazo.getUTCDate() === dia
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/projetos/${obraId}/tarefas?view=calendario&ano=${mesAnterior.ano}&mes=${mesAnterior.mes}`}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          ← Anterior
        </Link>
        <p className="text-sm font-semibold text-slate-800">
          {NOMES_MES[mes]} de {ano}
        </p>
        <Link
          href={`/projetos/${obraId}/tarefas?view=calendario&ano=${mesSeguinte.ano}&mes=${mesSeguinte.mes}`}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          Próximo →
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase text-slate-400">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={`vazio-${i}`} />;
          const dataCelula = new Date(Date.UTC(ano, mes, dia));
          const feriado = feriadoNoDia(dataCelula, feriados);
          const eventosDia = eventosNoDia(dia);
          const tarefasDia = tarefasNoDia(dia);
          return (
            <div
              key={dia}
              className={`min-h-[72px] rounded-lg border p-1.5 text-left ${feriado ? "border-red-200 bg-red-50" : "border-slate-100"}`}
            >
              <p className={`text-xs font-medium ${feriado ? "text-red-600" : "text-slate-600"}`}>
                {dia}
              </p>
              {feriado && (
                <p className="truncate text-[10px] text-red-500" title={feriado.nome}>
                  {feriado.nome}
                </p>
              )}
              <div className="mt-1 flex flex-col gap-0.5">
                {eventosDia.map((e) => (
                  <p
                    key={e.id}
                    className="truncate rounded px-1 text-[10px] text-white"
                    style={{ backgroundColor: e.cor ?? "#2563eb" }}
                    title={e.titulo}
                  >
                    {e.titulo}
                  </p>
                ))}
                {tarefasDia.map((t) => (
                  <p
                    key={t.id}
                    className="truncate rounded bg-slate-800 px-1 text-[10px] text-white"
                    title={`Prazo: ${t.titulo}`}
                  >
                    ⏰ {t.titulo}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-200" /> Feriado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Evento da agenda
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-800" /> Prazo de tarefa
        </span>
      </div>
    </div>
  );
}
