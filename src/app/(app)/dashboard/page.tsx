import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/dal";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { podeVerModulo } from "@/lib/permissoes";
import {
  formatBRL,
  formatDateOnly,
  formatHora,
  TRADE_LABEL,
  TIPO_EVENTO_LABEL,
} from "@/lib/labels";
import { CashflowChart, type MesFluxo } from "./cashflow-chart";

export const metadata: Metadata = {
  title: "Dashboard — Gestão de Obra",
};

function saudacao(hora: number) {
  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function inicioFimMes(data: Date) {
  const inicio = new Date(data.getFullYear(), data.getMonth(), 1);
  const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59, 999);
  return { inicio, fim };
}

export default async function DashboardPage() {
  const user = await getUser();
  const empresaAtivaId = await getEmpresaAtivaId();
  const agora = new Date();
  const podeVerFinanceiro = user?.papel === "ADMIN" || podeVerModulo(user, "financeiro");

  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const fimHoje = new Date(inicioHoje);
  fimHoje.setDate(fimHoje.getDate() + 1);
  const { inicio: inicioMes, fim: fimMes } = inicioFimMes(agora);

  const [obrasAtivas, obrasWorkspace, eventosHoje, aReceberMes, proximosRecebiveis] =
    await Promise.all([
      prisma.obra.count({
        where: { empresaId: empresaAtivaId ?? undefined, status: "EM_ANDAMENTO" },
      }),
      prisma.obra.findMany({
        where: { empresaId: empresaAtivaId ?? undefined, status: "EM_ANDAMENTO" },
        include: {
          trades: true,
          etapasProjeto: { select: { status: true } },
        },
        orderBy: { criadoEm: "desc" },
        take: 5,
      }),
      prisma.evento.findMany({
        where: {
          empresaId: empresaAtivaId ?? undefined,
          data: { gte: inicioHoje, lt: fimHoje },
        },
        orderBy: { data: "asc" },
      }),
      prisma.contaFinanceira.aggregate({
        where: {
          empresaId: empresaAtivaId ?? undefined,
          tipo: "RECEBER",
          status: "PENDENTE",
          dataVencimento: { gte: inicioMes, lte: fimMes },
        },
        _sum: { valor: true },
      }),
      prisma.contaFinanceira.findMany({
        where: {
          empresaId: empresaAtivaId ?? undefined,
          tipo: "RECEBER",
          status: "PENDENTE",
        },
        include: { obra: { select: { nome: true } } },
        orderBy: { dataVencimento: "asc" },
        take: 5,
      }),
    ]);

  // Fluxo de caixa — só calculado se o usuário tem permissão de ver (evita
  // consultas desnecessárias pra quem nunca vai ver o card).
  let mesesFluxo: MesFluxo[] = [];
  let previsaoReceita: { label: string; valor: number }[] = [];
  if (podeVerFinanceiro) {
    const seiseMesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 5, 1);
    const [lancamentos, contas] = await Promise.all([
      prisma.lancamentoFinanceiro.findMany({
        where: {
          obra: { empresaId: empresaAtivaId ?? undefined },
          data: { gte: seiseMesesAtras },
          tipo: { in: ["RECEITA", "CUSTO"] },
        },
        select: { tipo: true, valor: true, data: true },
      }),
      prisma.contaFinanceira.findMany({
        where: {
          empresaId: empresaAtivaId ?? undefined,
          dataVencimento: { gte: seiseMesesAtras },
        },
        select: { tipo: true, valor: true, dataVencimento: true, status: true },
      }),
    ]);

    const saldoPorMes = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      saldoPorMes.set(`${m.getFullYear()}-${m.getMonth()}`, 0);
    }
    for (const l of lancamentos) {
      const chave = `${l.data.getFullYear()}-${l.data.getMonth()}`;
      if (!saldoPorMes.has(chave)) continue;
      saldoPorMes.set(chave, (saldoPorMes.get(chave) ?? 0) + (l.tipo === "RECEITA" ? l.valor : -l.valor));
    }
    for (const c of contas) {
      const chave = `${c.dataVencimento.getFullYear()}-${c.dataVencimento.getMonth()}`;
      if (!saldoPorMes.has(chave)) continue;
      saldoPorMes.set(chave, (saldoPorMes.get(chave) ?? 0) + (c.tipo === "RECEBER" ? c.valor : -c.valor));
    }
    mesesFluxo = Array.from(saldoPorMes.entries()).map(([chave, saldo]) => {
      const [ano, mes] = chave.split("-").map(Number);
      const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(ano, mes, 1));
      return { label: label.replace(".", ""), saldo };
    });

    const previsaoPorMes = new Map<string, number>();
    for (let i = 1; i <= 3; i++) {
      const m = new Date(agora.getFullYear(), agora.getMonth() + i, 1);
      previsaoPorMes.set(`${m.getFullYear()}-${m.getMonth()}`, 0);
    }
    const contasFuturas = await prisma.contaFinanceira.findMany({
      where: {
        empresaId: empresaAtivaId ?? undefined,
        tipo: "RECEBER",
        dataVencimento: { gt: fimMes },
      },
      select: { valor: true, dataVencimento: true },
    });
    for (const c of contasFuturas) {
      const chave = `${c.dataVencimento.getFullYear()}-${c.dataVencimento.getMonth()}`;
      if (!previsaoPorMes.has(chave)) continue;
      previsaoPorMes.set(chave, (previsaoPorMes.get(chave) ?? 0) + c.valor);
    }
    previsaoReceita = Array.from(previsaoPorMes.entries()).map(([chave, valor]) => {
      const [ano, mes] = chave.split("-").map(Number);
      const label = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(ano, mes, 1));
      return { label: label.replace(".", ""), valor };
    });
  }

  const dataFormatada = capitalizar(
    new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(agora)
  );
  const hora = agora.getHours();
  const primeiroNome = (user?.nome ?? "").split(" ")[0] || "";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-6">
          <div className="flex items-start justify-between">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              {hora >= 6 && hora < 18 ? "☀️" : "🌙"} {dataFormatada}
            </p>
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {saudacao(hora)}, {primeiroNome || "usuário"}.
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Agenda e tarefas de hoje estão logo abaixo.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>● {obrasAtivas} projeto(s) ativo(s)</span>
            {podeVerFinanceiro && (
              <span>
                ● {formatBRL(aReceberMes._sum.valor ?? 0)} a receber este mês
              </span>
            )}
          </div>
        </div>

        {podeVerFinanceiro && (
          <div className="rounded-2xl border border-slate-200 bg-surface p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                💲 Honorários
              </p>
              <Link href="/financeiro" className="text-xs font-medium text-slate-500 hover:underline">
                Ver tudo →
              </Link>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatBRL(aReceberMes._sum.valor ?? 0)}
            </p>
            <p className="text-xs text-slate-500">a receber este mês</p>
            <div className="mt-4 flex flex-col gap-2">
              {proximosRecebiveis.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum recebimento pendente.</p>
              ) : (
                proximosRecebiveis.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-700">
                        {c.descricao}
                        {c.obra && <span className="text-slate-400"> — {c.obra.nome}</span>}
                      </p>
                      <p className="text-xs text-slate-400">
                        vence {formatDateOnly(c.dataVencimento)}
                      </p>
                    </div>
                    <span className="font-medium text-slate-900">
                      {formatBRL(c.valor)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              📁 Workspace
            </p>
            <Link href="/projetos" className="text-xs font-medium text-slate-500 hover:underline">
              Ver projetos →
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {obrasWorkspace.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum projeto em andamento.</p>
            ) : (
              obrasWorkspace.map((obra) => {
                const totalEtapas = obra.etapasProjeto.length;
                const concluidas = obra.etapasProjeto.filter((e) => e.status === "CONCLUIDA").length;
                const pct = totalEtapas > 0 ? Math.round((concluidas / totalEtapas) * 100) : 0;
                const tag =
                  obra.trades.length === 1 ? TRADE_LABEL[obra.trades[0].trade] : "Turn-key";
                return (
                  <Link
                    key={obra.id}
                    href={`/projetos/${obra.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-1 py-1 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{obra.nome}</p>
                      <p className="truncate text-xs text-slate-400">{obra.clienteNome}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase text-slate-600">
                      {tag}
                    </span>
                    <div className="w-24 shrink-0">
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
              })
            )}
          </div>
        </div>

        {podeVerFinanceiro ? (
          <div className="rounded-2xl border border-slate-200 bg-surface p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                🕐 Fluxo de caixa
              </p>
              <Link href="/financeiro/dashboard" className="text-xs font-medium text-slate-500 hover:underline">
                Relatórios →
              </Link>
            </div>
            <div className="mt-4">
              <CashflowChart meses={mesesFluxo} />
            </div>
            <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Previsão de receita
              </p>
              {previsaoReceita.map((p) => (
                <div key={p.label} className="flex items-center gap-2 text-sm">
                  <span className="w-8 shrink-0 text-xs uppercase text-slate-500">{p.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-300"
                      style={{
                        width: `${Math.max(4, (p.valor / Math.max(1, ...previsaoReceita.map((x) => x.valor))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-xs text-slate-600">
                    {formatBRL(p.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-surface p-6">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              📅 Agenda de hoje
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {eventosHoje.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum evento hoje.</p>
              ) : (
                eventosHoje.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{e.titulo}</span>
                    <span className="text-xs text-slate-400">
                      {TIPO_EVENTO_LABEL[e.tipo]} · {formatHora(e.data)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {podeVerFinanceiro && eventosHoje.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-surface p-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            📅 Agenda de hoje
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {eventosHoje.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{e.titulo}</span>
                <span className="text-xs text-slate-400">
                  {TIPO_EVENTO_LABEL[e.tipo]} · {formatHora(e.data)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
