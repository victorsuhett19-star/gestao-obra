import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import {
  STATUS_OBRA_LABEL,
  STATUS_OBRA_COLOR,
  TRADE_LABEL,
} from "@/lib/labels";
import { STATUS_OBRA, TRADES } from "@/lib/definitions";

export const metadata: Metadata = {
  title: "Obras — Gestão de Obra",
};

export default async function ObrasPage({
  searchParams,
}: PageProps<"/obras">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const trade = typeof sp.trade === "string" ? sp.trade : "";
  const empresaAtivaId = await getEmpresaAtivaId();

  const obras = await prisma.obra.findMany({
    where: {
      empresaId: empresaAtivaId ?? undefined,
      ...(status ? { status: status as (typeof STATUS_OBRA)[number] } : {}),
      ...(trade
        ? { trades: { some: { trade: trade as (typeof TRADES)[number] } } }
        : {}),
    },
    include: { trades: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Obras</h1>
          <p className="text-sm text-slate-500">
            {obras.length} {obras.length === 1 ? "obra encontrada" : "obras encontradas"}
          </p>
        </div>
        <Link
          href="/obras/novo"
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
        >
          + Nova obra
        </Link>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-surface p-4"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-xs font-medium text-slate-500">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Todos</option>
            {STATUS_OBRA.map((s) => (
              <option key={s} value={s}>
                {STATUS_OBRA_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="trade" className="text-xs font-medium text-slate-500">
            Especialidade
          </label>
          <select
            id="trade"
            name="trade"
            defaultValue={trade}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Todas</option>
            {TRADES.map((t) => (
              <option key={t} value={t}>
                {TRADE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Filtrar
        </button>
        {(status || trade) && (
          <Link
            href="/obras"
            className="text-sm text-slate-500 underline-offset-2 hover:underline"
          >
            Limpar filtros
          </Link>
        )}
      </form>

      {obras.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-10 text-center">
          <p className="text-sm text-slate-500">
            Nenhuma obra encontrada. Que tal cadastrar a primeira?
          </p>
          <Link
            href="/obras/novo"
            className="mt-3 inline-block text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            + Nova obra
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Obra</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Especialidades</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((obra) => (
                <tr
                  key={obra.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/obras/${obra.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {obra.nome}
                    </Link>
                    {obra.endereco && (
                      <p className="text-xs text-slate-500">{obra.endereco}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {obra.clienteNome ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {obra.trades.map((t) => (
                        <span
                          key={t.id}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {TRADE_LABEL[t.trade]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_OBRA_COLOR[obra.status]}`}
                    >
                      {STATUS_OBRA_LABEL[obra.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
