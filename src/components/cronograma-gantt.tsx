type Item = {
  id: string;
  grupo: string | null;
  nome: string;
  responsavel: string | null;
  dataInicio: Date;
  dataFim: Date;
  progresso: number;
};

const DIA_MS = 86_400_000;
const DIA_W = 22; // largura de cada dia na grade (px)
const COL = { tarefa: 260, resp: 130, prog: 72, ini: 66, fim: 66 };
const LEFT_W = COL.tarefa + COL.resp + COL.prog + COL.ini + COL.fim;
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const LETRAS = ["d", "s", "t", "q", "q", "s", "s"];

const COR_FEITO = "#1f7a4a";
const COR_RESTANTE = "#a9d18e";
const COR_HOJE = "#ad3815";

const dia = (d: Date) => Math.floor(d.getTime() / DIA_MS);
const dataCurta = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "2-digit" }).format(d);

// Cronograma de obra no formato de planilha: tarefas agrupadas por fase,
// responsável, progresso, início/término e a grade de dias em semanas, com
// a barra verde escura (feito) e clara (restante) e a linha do dia de hoje.
// Somente leitura, renderizado no servidor.
export function CronogramaGantt({ itens }: { itens: Item[] }) {
  if (itens.length === 0) {
    return <p className="text-sm text-slate-500">Cronograma ainda não montado.</p>;
  }

  // A grade começa na segunda-feira da semana da primeira tarefa e termina no domingo da última.
  const primeiro = Math.min(...itens.map((i) => dia(i.dataInicio)));
  const ultimo = Math.max(...itens.map((i) => dia(i.dataFim)));
  // 1970-01-01 foi quinta-feira: (dia + 3) % 7 = 0 para segunda.
  const inicioGrade = primeiro - ((primeiro + 3) % 7);
  const fimGrade = ultimo + (6 - ((ultimo + 3) % 7));
  const totalDias = fimGrade - inicioGrade + 1;
  const timelineW = totalDias * DIA_W;
  const semanas = Array.from({ length: totalDias / 7 }, (_, i) => inicioGrade + i * 7);
  const dias = Array.from({ length: totalDias }, (_, i) => inicioGrade + i);

  const agora = new Date();
  const hoje = Math.floor((Date.now() - agora.getTimezoneOffset() * 60_000) / DIA_MS);
  const hojeNaGrade = hoje >= inicioGrade && hoje <= fimGrade;

  // Agrupa por fase mantendo a ordem de aparição.
  const grupos: { nome: string | null; itens: Item[] }[] = [];
  for (const it of itens) {
    const g = grupos.find((x) => x.nome === it.grupo);
    if (g) g.itens.push(it);
    else grupos.push({ nome: it.grupo, itens: [it] });
  }

  const fundoGrade = {
    backgroundImage: [
      `repeating-linear-gradient(to right, transparent 0, transparent ${DIA_W - 1}px, rgba(148,163,184,0.28) ${DIA_W - 1}px, rgba(148,163,184,0.28) ${DIA_W}px)`,
      `repeating-linear-gradient(to right, transparent 0, transparent ${5 * DIA_W}px, rgba(148,163,184,0.14) ${5 * DIA_W}px, rgba(148,163,184,0.14) ${7 * DIA_W}px)`,
    ].join(","),
  };

  const celulaCabecalho = "flex items-center border-b border-r border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-white";

  function renderLinha(i: Item) {
    const ini = dia(i.dataInicio);
    const fim = dia(i.dataFim);
    const left = (ini - inicioGrade) * DIA_W;
    const width = (fim - ini + 1) * DIA_W;
    return (
      <div key={i.id} className="flex border-b border-slate-200">
        <div
          className="md:sticky left-0 z-10 flex shrink-0 items-stretch bg-surface text-xs text-slate-800"
          style={{ width: LEFT_W }}
        >
          <div className="flex items-center border-r border-slate-200 px-3 py-1.5 leading-tight" style={{ width: COL.tarefa }}>
            {i.nome}
          </div>
          <div
            className={`flex items-center border-r border-slate-200 px-2 py-1.5 leading-tight ${i.responsavel ? "" : "text-slate-400"}`}
            style={{ width: COL.resp }}
          >
            {i.responsavel || "—"}
          </div>
          <div className="flex items-center border-r border-slate-200 px-1.5" style={{ width: COL.prog }}>
            <div className="relative h-5 w-full overflow-hidden rounded-sm bg-slate-200/70">
              <div className="absolute inset-y-0 left-0 bg-slate-400/70" style={{ width: `${i.progresso}%` }} />
              <span className="relative z-10 flex h-full items-center justify-center text-[11px] font-medium text-slate-800">
                {i.progresso}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center border-r border-slate-200 text-[11px]" style={{ width: COL.ini }}>
            {dataCurta(i.dataInicio)}
          </div>
          <div className="flex items-center justify-center border-r border-slate-200 text-[11px]" style={{ width: COL.fim }}>
            {dataCurta(i.dataFim)}
          </div>
        </div>
        <div className="relative shrink-0" style={{ width: timelineW, ...fundoGrade }}>
          <div
            className="absolute top-1.5 h-[calc(100%-12px)] overflow-hidden rounded-sm"
            style={{ left, width, backgroundColor: COR_RESTANTE }}
            title={`${i.nome}: ${dataCurta(i.dataInicio)} → ${dataCurta(i.dataFim)} (${i.progresso}%)`}
          >
            <div className="h-full" style={{ width: `${i.progresso}%`, backgroundColor: COR_FEITO }} />
          </div>
          {hojeNaGrade && (
            <span
              className="pointer-events-none absolute inset-y-0"
              style={{
                left: (hoje - inicioGrade) * DIA_W,
                width: DIA_W,
                borderLeft: `2px solid ${COR_HOJE}`,
                borderRight: `2px solid ${COR_HOJE}`,
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <div style={{ width: LEFT_W + timelineW }}>
        {/* Cabeçalho: colunas + semanas + dias da semana + números */}
        <div className="flex">
          <div
            className="md:sticky left-0 z-20 flex shrink-0 flex-col"
            style={{ width: LEFT_W, backgroundColor: "#1e6b3a" }}
          >
            <div className="flex h-full items-end">
              {[
                ["Tarefa", COL.tarefa],
                ["Responsável", COL.resp],
                ["Progresso", COL.prog],
                ["Início", COL.ini],
                ["Término", COL.fim],
              ].map(([t, w]) => (
                <div
                  key={t as string}
                  className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                  style={{ width: w as number }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0" style={{ width: timelineW }}>
            <div className="flex">
              {semanas.map((s) => {
                const d = new Date(s * DIA_MS);
                return (
                  <div
                    key={s}
                    className={`${celulaCabecalho} justify-center`}
                    style={{ width: 7 * DIA_W, height: 22, backgroundColor: "#2f855a" }}
                  >
                    {d.getUTCDate()} de {MESES[d.getUTCMonth()]} de {d.getUTCFullYear()}
                  </div>
                );
              })}
            </div>
            <div className="flex">
              {dias.map((d) => (
                <div
                  key={d}
                  className={`${celulaCabecalho} justify-center`}
                  style={{
                    width: DIA_W,
                    height: 18,
                    backgroundColor: d === hoje ? COR_HOJE : "#1e6b3a",
                  }}
                >
                  {LETRAS[new Date(d * DIA_MS).getUTCDay()]}
                </div>
              ))}
            </div>
            <div className="flex">
              {dias.map((d) => (
                <div
                  key={d}
                  className={`${celulaCabecalho} justify-center`}
                  style={{
                    width: DIA_W,
                    height: 18,
                    backgroundColor: d === hoje ? COR_HOJE : "#1e6b3a",
                  }}
                >
                  {new Date(d * DIA_MS).getUTCDate()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {grupos.map((g, gi) => (
          <div key={gi}>
            {g.nome && (
              <div className="flex border-b border-slate-200">
                <div
                  className="md:sticky left-0 z-10 flex shrink-0 items-center px-3 py-2 text-xs font-bold uppercase tracking-wide"
                  style={{ width: LEFT_W, backgroundColor: "#d6e9cb", color: "#14351f" }}
                >
                  {g.nome}
                </div>
                <div className="shrink-0" style={{ width: timelineW, backgroundColor: "#d6e9cb" }} />
              </div>
            )}
            {g.itens.map((i) => renderLinha(i))}
          </div>
        ))}
      </div>
    </div>
  );
}
