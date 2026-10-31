import Link from "next/link";

export type ItemCalendario = {
  // Dia do calendário no formato YYYY-MM-DD.
  dia: string;
  label: string;
  cor: string;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Calendário do mês, renderizado no servidor. A navegação entre meses é por
// link (?mes=YYYY-MM) em `baseHref`.
export function CalendarioMensal({
  ano,
  mes,
  itens,
  baseHref,
}: {
  ano: number;
  mes: number; // 1-12
  itens: ItemCalendario[];
  baseHref: string;
}) {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1));
  const diasNoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const offset = primeiro.getUTCDay();
  const anterior = new Date(Date.UTC(ano, mes - 2, 1));
  const proximo = new Date(Date.UTC(ano, mes, 1));
  const href = (d: Date) =>
    `${baseHref}&mes=${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;

  const porDia = new Map<string, ItemCalendario[]>();
  for (const it of itens) {
    const lista = porDia.get(it.dia) ?? [];
    lista.push(it);
    porDia.set(it.dia, lista);
  }

  const agora = new Date();
  const hojeStr = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}`;

  const celulas: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <Link href={href(anterior)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100">
          ←
        </Link>
        <p className="text-sm font-semibold text-slate-800">
          {MESES[mes - 1]} de {ano}
        </p>
        <Link href={href(proximo)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100">
          →
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {DIAS_SEMANA.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={i} className="min-h-16 rounded-lg" />;
          const chave = `${ano}-${pad(mes)}-${pad(dia)}`;
          const lista = porDia.get(chave) ?? [];
          return (
            <div
              key={i}
              className={`min-h-16 rounded-lg border p-1 text-left ${chave === hojeStr ? "border-amber-500" : "border-slate-200"}`}
            >
              <p className={`text-xs ${chave === hojeStr ? "font-bold text-amber-500" : "text-slate-500"}`}>{dia}</p>
              <div className="mt-0.5 flex flex-col gap-0.5">
                {lista.map((it, j) => (
                  <span
                    key={j}
                    title={it.label}
                    className="truncate rounded px-1 text-[10px] font-medium text-white"
                    style={{ backgroundColor: it.cor }}
                  >
                    {it.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
