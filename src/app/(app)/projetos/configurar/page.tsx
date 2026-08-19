import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { TRADES } from "@/lib/definitions";
import { TRADE_LABEL } from "@/lib/labels";
import {
  excluirEtapaTemplate,
  moverEtapaTemplate,
} from "@/app/actions/etapa-projeto-template";
import { EtapaTemplateForm } from "./etapa-template-form";

export const metadata: Metadata = {
  title: "Configurar etapas — Gestão de Obra",
};

export default async function ConfigurarEtapasPage({
  searchParams,
}: PageProps<"/projetos/configurar">) {
  const sp = await searchParams;
  const tradeParam = typeof sp.trade === "string" ? sp.trade : TRADES[0];
  const trade = TRADES.includes(tradeParam as (typeof TRADES)[number])
    ? tradeParam
    : TRADES[0];

  const empresaAtivaId = await getEmpresaAtivaId();

  const etapas = await prisma.etapaProjetoTemplate.findMany({
    where: { empresaId: empresaAtivaId ?? undefined, trade: trade as never },
    orderBy: { ordem: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/projetos" className="text-sm text-slate-500 hover:underline">
          ← Projetos
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Configurar etapas do fluxo
        </h1>
        <p className="text-sm text-slate-500">
          Cada especialidade tem seu próprio fluxo de etapas. Isso vira o
          modelo usado quando você clica em &quot;Gerar fluxo&quot; num projeto
          novo.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {TRADES.map((t) => (
          <Link
            key={t}
            href={`/projetos/configurar?trade=${t}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              t === trade
                ? "bg-ink-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {TRADE_LABEL[t]}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-surface p-5">
        <EtapaTemplateForm trade={trade} />

        <div className="mt-5 flex flex-col gap-1.5">
          {etapas.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma etapa cadastrada para {TRADE_LABEL[trade]} ainda.
            </p>
          ) : (
            etapas.map((etapa, i) => (
              <div
                key={etapa.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs text-slate-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-slate-800">{etapa.nome}</p>
                    {etapa.grupo && (
                      <p className="text-xs text-orange-600">{etapa.grupo}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <form action={moverEtapaTemplate.bind(null, etapa.id, "up")}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moverEtapaTemplate.bind(null, etapa.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === etapas.length - 1}
                      className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={excluirEtapaTemplate.bind(null, etapa.id)}>
                    <button
                      type="submit"
                      className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
