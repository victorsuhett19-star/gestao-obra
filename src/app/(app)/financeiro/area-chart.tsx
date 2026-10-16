import { formatBRL } from "@/lib/labels";

export type AreaSerie = {
  key: string;
  label: string;
  cor: string;
  valores: number[];
};

const W = 800;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 52 };

function compacto(v: number) {
  const abs = Math.abs(v);
  const sinal = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sinal}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1000) return `${sinal}${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`;
  return `${sinal}${Math.round(abs)}`;
}

// Curva suave (Catmull-Rom convertida em bézier) passando por todos os pontos.
function caminhoSuave(pts: [number, number][]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Gráfico de áreas com curvas suaves em SVG puro (renderiza no servidor).
export function AreaChart({
  titulo,
  labels,
  series,
}: {
  titulo: string;
  labels: string[];
  series: AreaSerie[];
}) {
  const todos = series.flatMap((s) => s.valores);
  const minV = Math.min(0, ...todos);
  const maxBruto = Math.max(1, ...todos);
  const passo = Math.pow(10, Math.floor(Math.log10(maxBruto)));
  const maxV = Math.ceil(maxBruto / passo) * passo;
  const faixa = maxV - minV || 1;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (labels.length <= 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - ((v - minV) / faixa) * innerH;
  const baseY = y(Math.max(minV, 0));
  const ticks = [0, 1, 2, 3, 4].map((i) => minV + (faixa * i) / 4);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{titulo}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.cor }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label={titulo}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.cor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={s.cor} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="currentColor"
              className="text-slate-300"
              strokeOpacity="0.35"
              strokeDasharray="3 5"
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-slate-500"
              fontSize="11"
            >
              {compacto(t)}
            </text>
          </g>
        ))}

        {labels.map((l, i) => (
          <text
            key={`${l}-${i}`}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            className="fill-slate-500"
            fontSize="11"
          >
            {l}
          </text>
        ))}

        {series.map((s) => {
          const pts = s.valores.map((v, i): [number, number] => [x(i), y(v)]);
          const linha = caminhoSuave(pts);
          const area =
            pts.length > 1
              ? `${linha} L${pts[pts.length - 1][0]},${baseY} L${pts[0][0]},${baseY} Z`
              : "";
          return (
            <g key={s.key}>
              {area && <path d={area} fill={`url(#grad-${s.key})`} />}
              <path
                d={linha}
                fill="none"
                stroke={s.cor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {pts.map(([px, py], i) => (
                <circle key={i} cx={px} cy={py} r="4" fill={s.cor} stroke="#100b08" strokeWidth="2">
                  <title>{`${s.label} — ${labels[i]}: ${formatBRL(s.valores[i])}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
