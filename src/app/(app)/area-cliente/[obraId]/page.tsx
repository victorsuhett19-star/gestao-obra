import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { carregarAreaCliente } from "@/lib/area-cliente";
import { formatBRL, formatDateOnly, STATUS_OBRA_LABEL, STATUS_OBRA_COLOR } from "@/lib/labels";
import {
  adicionarLancamentoCliente,
  excluirLancamentoCliente,
  alternarFinanceiroPortal,
  salvarUfCalendario,
} from "@/app/actions/area-cliente";
import { prisma } from "@/lib/prisma";
import { TRADE_LABEL, formatHora } from "@/lib/labels";
import { ESTADOS, feriadosComUF } from "@/lib/feriados-uf";
import { PrazosEspecialidades } from "@/components/prazos-especialidades";
import { RelatorioTab } from "@/components/relatorio-tab";
import { CalendarioMensal, type ItemCalendario } from "@/components/calendario-mensal";
import { DonutChart } from "@/app/(app)/financeiro/donut-chart";
import { AreaChart } from "@/app/(app)/financeiro/area-chart";

export const metadata: Metadata = {
  title: "Área do cliente — VS Gestão de Obra",
};

const ABAS = [
  { key: "financeiro", label: "Financeiro" },
  { key: "prazos", label: "Prazos" },
  { key: "relatorio", label: "Relatório" },
  { key: "calendario", label: "Calendário" },
] as const;

export default async function AreaClienteObraPage({
  params,
  searchParams,
}: PageProps<"/area-cliente/[obraId]">) {
  const { obraId } = await params;
  const sp = await searchParams;
  const aba = ABAS.some((a) => a.key === sp.aba) ? (sp.aba as string) : "financeiro";
  const dados = await carregarAreaCliente(obraId);
  if (!dados) notFound();
  const { obra, lanc, custo, segments, serieGastos, serieLabels, gastoMes, variacaoMes } = dados;
  const hoje = new Date().toISOString().slice(0, 10);

  // Relatório
  const [templates, relatorios] =
    aba === "relatorio"
      ? await Promise.all([
          prisma.relatorioTemplate.findMany({
            where: { empresaId: obra.empresaId },
            orderBy: { nome: "asc" },
          }),
          prisma.relatorioObra.findMany({
            where: { obraId },
            orderBy: { criadoEm: "desc" },
            include: { criadoPor: true },
          }),
        ])
      : [[], []];

  // Calendário: eventos da agenda + prazos das especialidades + datas do fluxo de entrega.
  const agora = new Date();
  const mesParam = typeof sp.mes === "string" && /^\d{4}-\d{2}$/.test(sp.mes) ? sp.mes : null;
  const calAno = mesParam ? Number(mesParam.slice(0, 4)) : agora.getFullYear();
  const calMes = mesParam ? Number(mesParam.slice(5, 7)) : agora.getMonth() + 1;
  let itensCalendario: ItemCalendario[] = [];
  if (aba === "calendario") {
    const [eventos, etapas] = await Promise.all([
      prisma.evento.findMany({ where: { obraId }, orderBy: { data: "asc" } }),
      prisma.etapaProjeto.findMany({
        where: { obraId, data: { not: null } },
        select: { nome: true, data: true },
      }),
    ]);
    const p2 = (n: number) => String(n).padStart(2, "0");
    const diaLocal = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
    const diaUTC = (d: Date) => d.toISOString().slice(0, 10);
    const COR_FERIADO = { nacional: "#7c3aed", estadual: "#0891b2" };
    const feriados = feriadosComUF(calAno, obra.ufCalendario).map((f) => ({
      dia: f.dia,
      label: f.nome,
      cor: COR_FERIADO[f.tipo],
    }));
    itensCalendario = [
      ...feriados,
      ...eventos.map((e) => ({
        dia: diaLocal(e.data),
        label: `${formatHora(e.data)} ${e.titulo}`,
        cor: e.cor ?? "#2563eb",
      })),
      ...obra.trades.flatMap((t) => [
        ...(t.dataInicio
          ? [{ dia: diaUTC(t.dataInicio), label: `Início ${TRADE_LABEL[t.trade] ?? t.trade}`, cor: "#16a34a" }]
          : []),
        ...(t.dataFim
          ? [{ dia: diaUTC(t.dataFim), label: `Fim ${TRADE_LABEL[t.trade] ?? t.trade}`, cor: "#dc2626" }]
          : []),
      ]),
      ...etapas.map((e) => ({ dia: diaUTC(e.data as Date), label: e.nome, cor: "#b45309" })),
    ];
  }
  const campo =
    "rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-500";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/area-cliente" className="text-sm text-slate-500 hover:underline">
            ← Área do cliente
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">{obra.nome}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_OBRA_COLOR[obra.status]}`}>
              {STATUS_OBRA_LABEL[obra.status]}
            </span>
          </div>
          <p className="text-sm text-slate-500">{obra.clienteNome ?? "Sem cliente"}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/projetos/${obra.id}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Abrir projeto
          </Link>
          <Link
            href={`/area-cliente/${obra.id}/apresentar`}
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
          >
            📊 Apresentar ao cliente
          </Link>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        {ABAS.map((a) => (
          <Link
            key={a.key}
            href={`/area-cliente/${obra.id}?aba=${a.key}`}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${aba === a.key ? "border-amber-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {a.label}
          </Link>
        ))}
      </nav>

      {aba === "prazos" && <PrazosEspecialidades obraId={obra.id} prazos={obra.trades} />}

      {aba === "relatorio" && (
        <div className="flex flex-col gap-4">
          <a
            href={`/api/obras/${obra.id}/relatorio`}
            target="_blank"
            rel="noreferrer"
            className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            📄 Gerar relatório digital (PDF)
          </a>
          <RelatorioTab obraId={obra.id} templates={templates} relatorios={relatorios} />
        </div>
      )}

      {aba === "calendario" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-600" />Agenda</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-600" />Início de especialidade</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-600" />Fim de especialidade</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-700" />Fluxo de entrega</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-600" />Feriado nacional</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-600" />Feriado estadual</span>
            </div>
            <form action={salvarUfCalendario.bind(null, obra.id)} className="flex items-center gap-2">
              <label className="text-xs text-slate-500" htmlFor="uf">Feriados do estado</label>
              <select
                id="uf"
                name="uf"
                defaultValue={obra.ufCalendario ?? ""}
                className="rounded-lg border border-slate-300 bg-transparent px-2 py-1.5 text-sm text-slate-800"
              >
                <option value="">Só nacionais</option>
                {Object.entries(ESTADOS).map(([sigla, nome]) => (
                  <option key={sigla} value={sigla}>{sigla} — {nome}</option>
                ))}
              </select>
              <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Aplicar
              </button>
            </form>
            <Link
              href={`/projetos/${obra.id}/agenda/novo`}
              className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700"
            >
              + Novo evento
            </Link>
          </div>
          <CalendarioMensal
            ano={calAno}
            mes={calMes}
            itens={itensCalendario}
            baseHref={`/area-cliente/${obra.id}?aba=calendario`}
          />
        </div>
      )}

      {aba === "financeiro" && (
      <>
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">Visível no portal do cliente</p>
          <p className="text-xs text-slate-500">
            {obra.clienteAcessoId
              ? obra.financeiroPortalVisivel
                ? "O cliente está vendo este financeiro no portal dele."
                : "Oculto: o cliente ainda não vê este financeiro no portal."
              : "Este projeto ainda não tem login de cliente vinculado (faça isso na visão geral do projeto)."}
          </p>
        </div>
        <form action={alternarFinanceiroPortal.bind(null, obra.id)}>
          <button
            type="submit"
            className={`rounded-lg px-4 py-2 text-sm font-medium ${obra.financeiroPortalVisivel ? "border border-slate-300 text-slate-700 hover:bg-slate-100" : "bg-ink-900 text-white hover:bg-ink-700"}`}
          >
            {obra.financeiroPortalVisivel ? "Ocultar do cliente" : "Mostrar ao cliente"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-500/20 blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gasto total da obra</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatBRL(custo)}</p>

        </div>
        <div className="card relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Gasto no mês</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatBRL(gastoMes)}</p>
          <p className="mt-2 text-xs text-slate-400">
            {variacaoMes === null ? "— vs mês anterior" : (
              <>
                <span className={`rounded-full px-2 py-0.5 font-semibold ${variacaoMes <= 0 ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}>
                  {variacaoMes >= 0 ? "▲" : "▼"} {Math.abs(variacaoMes).toFixed(1)}%
                </span>{" "}
                vs mês anterior
              </>
            )}
          </p>
        </div>
        <div className="card relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-500/20 blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lançamentos</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{lanc.length}</p>

        </div>
      </div>

      <AreaChart
        titulo="Gastos por mês — últimos 6 meses"
        labels={serieLabels}
        series={[{ key: "gastos", label: "Gastos", cor: "#f59e0b", valores: serieGastos }]}
      />

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">Novo gasto</p>
        <form
          action={adicionarLancamentoCliente.bind(null, obra.id)}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5"
        >
          <input name="descricao" required placeholder="Descrição" className={`${campo} sm:col-span-2`} />
          <input name="categoria" placeholder="Categoria (ex: Material)" className={campo} />
          <input name="valor" required inputMode="decimal" placeholder="Valor (ex: 5.430,00)" className={campo} />
          <input name="data" type="date" defaultValue={hoje} className={campo} />
          <button
            type="submit"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 sm:col-span-5 sm:justify-self-start"
          >
            + Adicionar
          </button>
        </form>
      </div>

      <DonutChart titulo="Custo da obra por categoria" segments={segments} />

      <div className="card overflow-x-auto">
        {lanc.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            Nenhum gasto lançado ainda — este financeiro começa do zero.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {lanc.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-500">{formatDateOnly(l.data)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{l.descricao}</td>
                  <td className="px-4 py-3 text-slate-500">{l.categoria ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{formatBRL(l.valor)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/area-cliente/${obra.id}/${l.id}/editar`}
                      className="text-xs font-medium text-slate-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={excluirLancamentoCliente.bind(null, obra.id, l.id)}>
                      <button type="submit" className="text-xs font-medium text-red-500 hover:underline">
                        Excluir
                      </button>
                    </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </>
      )}
    </div>
  );
}
