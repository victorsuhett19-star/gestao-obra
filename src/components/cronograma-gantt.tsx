type Item = {
  id: string;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  progresso: number;
};

const DIA = 86_400_000;
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function dia(d: Date) {
  return Math.floor(d.getTime() / DIA);
}
function curta(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" }).format(d);
}

// Cronograma em barras (Gantt) — somente leitura, renderizado no servidor.
// Usado na Área do cliente (equipe), na apresentação e no portal do cliente.
export function CronogramaGantt({ itens }: { itens: Item[] }) {
  if (itens.length === 0) {
    return <p className="text-sm text-slate-500">Cronograma ainda não montado.</p>;
  }

  const primeiro = Math.min(...itens.map((i) => dia(i.dataInicio)));
  const ultimo = Math.max(...itens.map((i) => dia(i.dataFim)));
  const total = Math.max(1, ultimo - primeiro + 1);
  const pct = (d: number) => ((d - primeiro) / total) * 100;

  // Marcas de mês no eixo.
  const marcas: { left: number; label: string }[] = [];
  const cursor = new Date(primeiro * DIA);
  cursor.setUTCDate(1);
  if (dia(cursor) < primeiro) cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  while (dia(cursor) <= ultimo) {
    marcas.push({
      left: pct(dia(cursor)),
      label: `${MESES[cursor.getUTCMonth()]}/${String(cursor.getUTCFullYear()).slice(2)}`,
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  const agora = new Date();
  const hoje = Math.floor((Date.now() - agora.getTimezoneOffset() * 60_000) / DIA);
  const hojePct = hoje >= primeiro && hoje <= ultimo ? pct(hoje) : null;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="flex">
          <div className="w-44 shrink-0" />
          <div className="relative h-6 flex-1 border-b border-slate-200">
            {marcas.map((m) => (
              <span
                key={m.label}
                className="absolute top-0 -translate-x-0 text-[10px] text-slate-500"
                style={{ left: `${m.left}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {itens.map((i) => {
          const ini = dia(i.dataInicio);
          const fim = dia(i.dataFim);
          const left = pct(ini);
          const width = Math.max(1.5, ((fim - ini + 1) / total) * 100);
          return (
            <div key={i.id} className="flex items-center border-b border-slate-100 py-1.5">
              <div className="w-44 shrink-0 pr-3">
                <p className="truncate text-sm font-medium text-slate-800" title={i.nome}>
                  {i.nome}
                </p>
                <p className="text-[11px] text-slate-500">
                  {curta(i.dataInicio)} → {curta(i.dataFim)} · {i.progresso}%
                </p>
              </div>
              <div className="relative h-6 flex-1">
                {marcas.map((m) => (
                  <span
                    key={m.label}
                    className="absolute top-0 h-full w-px bg-slate-100"
                    style={{ left: `${m.left}%` }}
                  />
                ))}
                {hojePct !== null && (
                  <span
                    className="absolute top-0 h-full w-px bg-amber-500"
                    style={{ left: `${hojePct}%` }}
                  />
                )}
                <div
                  className="absolute top-1 h-4 overflow-hidden rounded-full bg-amber-500/25"
                  style={{ left: `${left}%`, width: `${width}%` }}
                  title={`${i.nome}: ${curta(i.dataInicio)} → ${curta(i.dataFim)} (${i.progresso}%)`}
                >
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${i.progresso}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
