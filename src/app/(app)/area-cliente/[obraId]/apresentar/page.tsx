import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { carregarAreaCliente } from "@/lib/area-cliente";
import {
  formatBRL,
  formatDateOnly,
  STATUS_OBRA_LABEL,
  TRADE_LABEL,
} from "@/lib/labels";
import { DonutChart } from "@/app/(app)/financeiro/donut-chart";
import { BotaoImprimir } from "@/components/botao-imprimir";

export const metadata: Metadata = {
  title: "Apresentação ao cliente — VS Gestão de Obra",
};

export default async function ApresentarClientePage({
  params,
}: PageProps<"/area-cliente/[obraId]/apresentar">) {
  const { obraId } = await params;
  const dados = await carregarAreaCliente(obraId);
  if (!dados) notFound();
  const { obra, lanc, custo, pago, saldo, segments, progresso, totalEtapas } = dados;
  const pctPago = custo > 0 ? Math.min(100, (pago / custo) * 100) : 0;
  const prazos = obra.trades.filter((t) => t.dataInicio || t.dataFim);

  return (
    <div className="flex flex-col gap-6">
      {/* Imprime só a área de apresentação (esconde menu lateral e topo). */}
      <style>{`@media print {
        body * { visibility: hidden; }
        .print-area, .print-area * { visibility: visible; }
        .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
      }`}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href={`/area-cliente/${obra.id}`} className="text-sm text-slate-500 hover:underline">
          ← Voltar ao financeiro do cliente
        </Link>
        <BotaoImprimir />
      </div>

      <div className="print-area flex flex-col gap-6">
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Acompanhamento da obra
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{obra.nome}</h1>
          <p className="text-sm text-slate-500">
            {obra.clienteNome ?? "Cliente"} · {STATUS_OBRA_LABEL[obra.status]}
            {obra.endereco ? ` · ${obra.endereco}` : ""}
          </p>
          {totalEtapas > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Andamento do projeto</span>
                <span>{progresso}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${progresso}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Custo da obra</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{formatBRL(custo)}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Já pago</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-500">{formatBRL(pago)}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pctPago}%` }} />
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Saldo a pagar</p>
            <p className={`mt-2 text-2xl font-semibold ${saldo > 0 ? "text-amber-500" : "text-emerald-500"}`}>
              {formatBRL(saldo)}
            </p>
          </div>
        </div>

        {prazos.length > 0 && (
          <div className="card p-5">
            <p className="text-sm font-semibold text-slate-800">Prazos</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {prazos.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-800">{TRADE_LABEL[t.trade] ?? t.trade}</span>
                  <span className="text-slate-500">
                    {t.dataInicio ? formatDateOnly(t.dataInicio) : "—"} → {t.dataFim ? formatDateOnly(t.dataFim) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DonutChart titulo="Para onde vai o custo da obra" segments={segments} />

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {lanc.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Nenhum lançamento registrado.
                  </td>
                </tr>
              ) : (
                lanc.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-500">{formatDateOnly(l.data)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{l.descricao}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {l.tipo === "PAGAMENTO" ? "Pagamento recebido" : (l.categoria ?? "—")}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-medium ${l.tipo === "PAGAMENTO" ? "text-emerald-500" : "text-slate-900"}`}
                    >
                      {l.tipo === "PAGAMENTO" ? "− " : ""}
                      {formatBRL(l.valor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
