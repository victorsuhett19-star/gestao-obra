import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { STATUS_OBRA_LABEL, STATUS_OBRA_COLOR, TRADE_LABEL } from "@/lib/labels";
import { obraNavItems } from "./obra-nav-items";
import { ObraTabs } from "./obra-tabs";

export default async function ObraLayout({
  children,
  params,
}: LayoutProps<"/obras/[obraId]">) {
  const { obraId } = await params;

  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: { trades: true },
  });

  if (!obra) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/obras"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Obras
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">
                {obra.nome}
              </h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_OBRA_COLOR[obra.status]}`}
              >
                {STATUS_OBRA_LABEL[obra.status]}
              </span>
            </div>
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
          <Link
            href={`/obras/${obra.id}/editar`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Editar
          </Link>
        </div>
      </div>

      <ObraTabs items={obraNavItems(obra.id)} />

      {children}
    </div>
  );
}
