import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { TIPO_CLIENTE_ORCAMENTO } from "@/lib/definitions";
import { criarOrcamento } from "@/app/actions/orcamento-ia";
import { formatDate, TIPO_CLIENTE_ORCAMENTO_LABEL } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Orçamento IA — VS Gestão de Obra",
};

export default async function OrcamentoIAPage() {
  const empresaAtivaId = await getEmpresaAtivaId();

  const [orcamentos, obras] = await Promise.all([
    prisma.orcamentoIA.findMany({
      where: { empresaId: empresaAtivaId ?? undefined },
      include: { obra: { select: { nome: true } }, pecas: true },
      orderBy: { criadoEm: "desc" },
    }),
    prisma.obra.findMany({
      where: { empresaId: empresaAtivaId ?? undefined },
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Orçamento IA</h1>
          <p className="text-sm text-slate-500">
            Calcule o custo de peças de marcenaria, vidraçaria e marmoraria a
            partir das medidas, usando a tabela de preços por m² da empresa.
          </p>
        </div>
        <Link
          href="/orcamento-ia/materiais"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          ⚙️ Tabela de preços
        </Link>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">Novo orçamento</p>
        <form action={criarOrcamento} className="mt-3 flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Nome</label>
            <input
              name="nome"
              placeholder="Ex: Cozinha Fernanda"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Tipo de cliente</label>
            <select
              name="tipoCliente"
              defaultValue="METRAGEM_COMUM"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              {TIPO_CLIENTE_ORCAMENTO.map((t) => (
                <option key={t} value={t}>
                  {TIPO_CLIENTE_ORCAMENTO_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          {obras.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Obra (opcional)</label>
              <select
                name="obraId"
                defaultValue=""
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="">Sem vínculo</option>
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
          >
            Criar orçamento
          </button>
        </form>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">Orçamentos</p>
        <div className="mt-3 flex flex-col gap-2">
          {orcamentos.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum orçamento criado ainda.</p>
          ) : (
            orcamentos.map((o) => (
              <Link
                key={o.id}
                href={`/orcamento-ia/${o.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-800">{o.nome}</p>
                  <p className="text-xs text-slate-400">
                    {TIPO_CLIENTE_ORCAMENTO_LABEL[o.tipoCliente]}
                    {o.obra && ` · ${o.obra.nome}`} · {o.pecas.length} peça(s) ·{" "}
                    {formatDate(o.criadoEm)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
