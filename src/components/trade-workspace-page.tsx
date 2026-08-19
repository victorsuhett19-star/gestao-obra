import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { STATUS_OBRA_LABEL, STATUS_OBRA_COLOR, TRADE_LABEL } from "@/lib/labels";

// Workspace de uma especialidade — lista os projetos daquela especialidade
// no mesmo estilo do card "Workspace" do dashboard, já conectado com a tela
// de Projetos (clicar num projeto abre o fluxo de entrega, orçamento,
// financeiro e dashboard dele).
export async function TradeWorkspacePage({
  trade,
}: {
  trade: "MARCENARIA" | "MARMORARIA" | "VIDRACARIA";
}) {
  const empresaAtivaId = await getEmpresaAtivaId();

  const obras = await prisma.obra.findMany({
    where: {
      empresaId: empresaAtivaId ?? undefined,
      trades: { some: { trade } },
    },
    include: {
      trades: true,
      etapasProjeto: { select: { status: true } },
    },
    orderBy: { criadoEm: "desc" },
  });

  const emAndamento = obras.filter((o) => o.status === "EM_ANDAMENTO").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {TRADE_LABEL[trade]}
        </h1>
        <p className="text-sm text-slate-500">
          {obras.length} projeto(s) · {emAndamento} em andamento
        </p>
      </div>

      {obras.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum projeto de {TRADE_LABEL[trade].toLowerCase()} ainda.
          </p>
          <Link
            href="/obras/novo"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Cadastrar obra/projeto
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {obras.map((obra) => {
            const total = obra.etapasProjeto.length;
            const concluidas = obra.etapasProjeto.filter((e) => e.status === "CONCLUIDA").length;
            const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
            const turnkey = obra.trades.length > 1;
            return (
              <Link
                key={obra.id}
                href={`/projetos/${obra.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-900">{obra.nome}</p>
                    {turnkey && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        Turn-key
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-slate-500">{obra.clienteNome}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_OBRA_COLOR[obra.status]}`}
                >
                  {STATUS_OBRA_LABEL[obra.status]}
                </span>
                <div className="w-28 shrink-0">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-right text-[11px] text-slate-400">{pct}%</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
