import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_OBRA_LABEL, STATUS_OBRA_COLOR, TRADE_LABEL } from "@/lib/labels";
import { marcarTurnkey } from "@/app/actions/projetos";
import { ObraTabs } from "@/app/(app)/obras/[obraId]/obra-tabs";
import { projetoNavItems } from "./projeto-nav-items";

export default async function ProjetoLayout({
  children,
  params,
}: LayoutProps<"/projetos/[obraId]">) {
  const { obraId } = await params;

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: { trades: true },
  });

  if (!obra) {
    notFound();
  }

  const jaTurnkey = obra.trades.some((t) => t.trade === "OBRA");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/projetos" className="text-sm text-slate-500 hover:text-slate-800">
          ← Projetos
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">{obra.nome}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_OBRA_COLOR[obra.status]}`}
              >
                {STATUS_OBRA_LABEL[obra.status]}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{obra.clienteNome}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {obra.trades.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  {TRADE_LABEL[t.trade]}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!jaTurnkey && (
              <form action={marcarTurnkey.bind(null, obra.id)}>
                <button
                  type="submit"
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                >
                  🔗 Cliente fechou obra completa (turn-key)
                </button>
              </form>
            )}
            <Link
              href={`/obras/${obra.id}`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Ver obra completa →
            </Link>
          </div>
        </div>
      </div>

      <ObraTabs items={projetoNavItems(obra.id)} />

      {children}
    </div>
  );
}
