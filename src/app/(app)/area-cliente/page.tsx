import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { formatBRL, STATUS_OBRA_LABEL, STATUS_OBRA_COLOR } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Área do cliente — VS Gestão de Obra",
};

export default async function AreaClientePage({
  searchParams,
}: PageProps<"/area-cliente">) {
  const sp = await searchParams;
  const todos = sp.todos === "1";
  const empresaAtivaId = await getEmpresaAtivaId();

  const obras = await prisma.obra.findMany({
    where: {
      empresaId: empresaAtivaId ?? undefined,
      ...(todos ? {} : { status: "EM_ANDAMENTO" }),
    },
    include: { lancamentosCliente: { select: { tipo: true, valor: true } } },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Área do cliente</h1>
          <p className="text-sm text-slate-500">
            Financeiro próprio de cada projeto em execução — a equipe lança o custo
            da obra e o que o cliente já pagou, e apresenta o resumo a ele.
          </p>
        </div>
        <Link
          href={todos ? "/area-cliente" : "/area-cliente?todos=1"}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {todos ? "Só em andamento" : "Mostrar todos os projetos"}
        </Link>
      </div>

      {obras.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhum projeto {todos ? "cadastrado" : "em andamento"} ainda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {obras.map((o) => {
            const custo = o.lancamentosCliente
              .filter((l) => l.tipo === "CUSTO")
              .reduce((a, l) => a + l.valor, 0);
            const pago = o.lancamentosCliente
              .filter((l) => l.tipo === "PAGAMENTO")
              .reduce((a, l) => a + l.valor, 0);
            const saldo = custo - pago;
            const pct = custo > 0 ? Math.min(100, (pago / custo) * 100) : 0;
            return (
              <Link
                key={o.id}
                href={`/area-cliente/${o.id}`}
                className="card relative flex flex-col gap-3 overflow-hidden p-5 transition hover:border-slate-400"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{o.nome}</p>
                    <p className="text-xs text-slate-500">{o.clienteNome ?? "Sem cliente"}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_OBRA_COLOR[o.status]}`}>
                    {STATUS_OBRA_LABEL[o.status]}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Custo</p>
                    <p className="font-semibold text-slate-900">{formatBRL(custo)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Pago</p>
                    <p className="font-semibold text-emerald-500">{formatBRL(pago)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Saldo</p>
                    <p className={`font-semibold ${saldo > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                      {formatBRL(saldo)}
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
