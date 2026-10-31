import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { carregarAreaCliente } from "@/lib/area-cliente";
import { formatBRL, formatDateOnly, STATUS_OBRA_LABEL, STATUS_OBRA_COLOR } from "@/lib/labels";
import {
  adicionarLancamentoCliente,
  excluirLancamentoCliente,
  alternarFinanceiroPortal,
} from "@/app/actions/area-cliente";
import { DonutChart } from "@/app/(app)/financeiro/donut-chart";

export const metadata: Metadata = {
  title: "Área do cliente — VS Gestão de Obra",
};

export default async function AreaClienteObraPage({
  params,
}: PageProps<"/area-cliente/[obraId]">) {
  const { obraId } = await params;
  const dados = await carregarAreaCliente(obraId);
  if (!dados) notFound();
  const { obra, lanc, custo, pago, saldo, segments } = dados;
  const hoje = new Date().toISOString().slice(0, 10);
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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Custo da obra</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatBRL(custo)}</p>
        </div>
        <div className="card relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pago pelo cliente</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-500">{formatBRL(pago)}</p>
        </div>
        <div className="card relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Saldo a pagar</p>
          <p className={`mt-2 text-2xl font-semibold ${saldo > 0 ? "text-amber-500" : "text-emerald-500"}`}>
            {formatBRL(saldo)}
          </p>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">Novo lançamento</p>
        <form
          action={adicionarLancamentoCliente.bind(null, obra.id)}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-6"
        >
          <select name="tipo" className={campo} defaultValue="CUSTO">
            <option value="CUSTO">Custo da obra</option>
            <option value="PAGAMENTO">Pagamento do cliente</option>
          </select>
          <input name="descricao" required placeholder="Descrição" className={`${campo} sm:col-span-2`} />
          <input name="categoria" placeholder="Categoria (ex: Material)" className={campo} />
          <input name="valor" required inputMode="decimal" placeholder="Valor (ex: 5.430,00)" className={campo} />
          <input name="data" type="date" defaultValue={hoje} className={campo} />
          <button
            type="submit"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-700 sm:col-span-6 sm:justify-self-start"
          >
            + Adicionar
          </button>
        </form>
      </div>

      <DonutChart titulo="Custo da obra por categoria" segments={segments} />

      <div className="card overflow-x-auto">
        {lanc.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            Nenhum lançamento ainda — este financeiro começa do zero.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Tipo</th>
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
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${l.tipo === "CUSTO" ? "bg-red-500/15 text-red-500" : "bg-emerald-500/15 text-emerald-500"}`}
                    >
                      {l.tipo === "CUSTO" ? "Custo" : "Pagamento"}
                    </span>
                  </td>
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
    </div>
  );
}
