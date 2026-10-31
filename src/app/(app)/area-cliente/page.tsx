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
            Financeiro próprio de cada projeto em execução — a equipe lança os
            gastos da obra, acompanha mês a mês e apresenta o resumo ao cliente.
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
            const qtd = o.lancamentosCliente.filter((l) => l.tipo === "CUSTO").length;
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
                <div className="text-xs">
                  <p className="text-slate-500">Gasto total</p>
                  <p className="text-lg font-semibold text-slate-900">{formatBRL(custo)}</p>
                  <p className="text-slate-400">{qtd} {qtd === 1 ? "lançamento" : "lançamentos"}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
