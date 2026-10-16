import { TRADE_LABEL } from "@/lib/labels";
import { RemoverEspecialidadeButton } from "./remover-especialidade-button";
import { salvarPrazoTrade } from "@/app/actions/projetos";

type Prazo = {
  id: string;
  trade: string;
  dataInicio: Date | null;
  dataFim: Date | null;
};

const ORDEM = ["OBRA", "PROJETO", "MARCENARIA", "MARMORARIA", "VIDRACARIA", "SERRALHERIA"];
const DIA = 86_400_000;

// Datas são guardadas como dia (UTC); compara tudo em "dias inteiros".
function diaUTC(d: Date) {
  return Math.floor(d.getTime() / DIA);
}
function paraInput(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "";
}

function contagem(inicio: Date | null, fim: Date | null) {
  const hoje = Math.floor(
    (Date.now() - new Date().getTimezoneOffset() * 60_000) / DIA
  );
  if (!inicio && !fim) return null;
  const i = inicio ? diaUTC(inicio) : null;
  const f = fim ? diaUTC(fim) : null;

  if (i !== null && hoje < i) {
    const n = i - hoje;
    return { texto: `Começa em ${n} ${n === 1 ? "dia" : "dias"}`, cor: "text-sky-500", pct: 0 };
  }
  if (f !== null && hoje > f) {
    const n = hoje - f;
    return { texto: `Encerrado há ${n} ${n === 1 ? "dia" : "dias"}`, cor: "text-slate-500", pct: 100 };
  }
  if (f !== null) {
    const n = f - hoje;
    const total = i !== null ? Math.max(1, f - i) : null;
    const pct = total && i !== null ? Math.min(100, Math.max(0, ((hoje - i) / total) * 100)) : 0;
    return {
      texto: n === 0 ? "Termina hoje" : `Faltam ${n} ${n === 1 ? "dia" : "dias"}`,
      cor: n <= 3 ? "text-amber-500" : "text-emerald-500",
      pct,
    };
  }
  const n = hoje - (i as number);
  return { texto: `${n} ${n === 1 ? "dia" : "dias"} em andamento`, cor: "text-emerald-500", pct: 0 };
}

export function PrazosEspecialidades({
  obraId,
  prazos,
}: {
  obraId: string;
  prazos: Prazo[];
}) {
  if (prazos.length === 0) return null;
  const ordenados = [...prazos].sort(
    (a, b) => ORDEM.indexOf(a.trade) - ORDEM.indexOf(b.trade)
  );

  return (
    <div className="card p-5">
      <p className="text-sm font-semibold text-slate-800">Prazos por especialidade</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Data de início e fim de cada etapa do projeto, com a contagem de dias.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ordenados.map((p) => {
          const c = contagem(p.dataInicio, p.dataFim);
          return (
            <div key={p.id} className="relative rounded-xl border border-slate-200 p-4">
            <form
              action={salvarPrazoTrade.bind(null, obraId, p.id)}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {TRADE_LABEL[p.trade] ?? p.trade}
                </p>
                <p className={`text-sm font-semibold ${c?.cor ?? "text-slate-400"}`}>
                  {c ? c.texto : "Sem datas"}
                </p>
              </div>
              {c && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                  Início
                  <input
                    type="date"
                    name="dataInicio"
                    defaultValue={paraInput(p.dataInicio)}
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-500"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                  Fim
                  <input
                    type="date"
                    name="dataFim"
                    defaultValue={paraInput(p.dataFim)}
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-500"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="self-start rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-700"
              >
                Salvar datas
              </button>
            </form>
            {/* Fora do form de datas: o botão tem o próprio form de confirmação. */}
            <div className="absolute bottom-4 right-4">
              <RemoverEspecialidadeButton
                obraId={obraId}
                obraTradeId={p.id}
                nome={TRADE_LABEL[p.trade] ?? p.trade}
              />
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
