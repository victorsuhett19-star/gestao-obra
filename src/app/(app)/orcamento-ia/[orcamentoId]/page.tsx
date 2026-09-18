import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import {
  TIPO_CLIENTE_ORCAMENTO,
  RT_POR_TIPO_CLIENTE,
} from "@/lib/definitions";
import { TIPO_CLIENTE_ORCAMENTO_LABEL, formatBRL } from "@/lib/labels";
import {
  adicionarPeca,
  excluirPeca,
  atualizarConfigOrcamento,
  excluirOrcamento,
  anexarPdfExecutivo,
  removerPdfExecutivo,
} from "@/app/actions/orcamento-ia";
import { AnalisePdfForm } from "./analise-pdf-form";

// A análise do PDF pela IA (upload + leitura pela Anthropic) pode levar
// mais que os 10s padrão do Vercel — sem isso a função é encerrada no meio
// e o navegador mostra um erro genérico de "página não carregou".
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Orçamento — VS Gestão de Obra",
};

function custoPeca(peca: {
  comprimento: number;
  largura: number;
  tipoMaterial: { valorM2: number; ferragemPercent: number; complexidadePercent: number };
}) {
  const m2 = peca.comprimento * peca.largura;
  const custo =
    m2 *
    peca.tipoMaterial.valorM2 *
    (1 + peca.tipoMaterial.ferragemPercent) *
    (1 + peca.tipoMaterial.complexidadePercent);
  return { m2, custo };
}

export default async function OrcamentoIADetalhePage({
  params,
}: PageProps<"/orcamento-ia/[orcamentoId]">) {
  const { orcamentoId } = await params;

  const [orcamento, tiposMaterial] = await Promise.all([
    prisma.orcamentoIA.findUnique({
      where: { id: orcamentoId },
      include: {
        obra: { select: { nome: true } },
        arquivoExecutivo: { select: { id: true, nomeOriginal: true } },
        pecas: { include: { tipoMaterial: true }, orderBy: { criadoEm: "asc" } },
      },
    }),
    prisma.tipoMaterialOrcamento.findMany({ orderBy: { ordem: "asc" } }),
  ]);

  if (!orcamento) notFound();

  const pecasComCusto = orcamento.pecas.map((p) => ({ ...p, ...custoPeca(p) }));
  const custoTotal = pecasComCusto.reduce((acc, p) => acc + p.custo, 0);
  const rt = RT_POR_TIPO_CLIENTE[orcamento.tipoCliente] ?? 0;
  const custoComRT = custoTotal * (1 + rt);
  const valorFinal = custoComRT * (1 + orcamento.margemPercent);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <BackLink href="/orcamento-ia" label="Orçamento IA" />
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            {orcamento.nome}
          </h1>
          {orcamento.obra && (
            <p className="text-sm text-slate-500">Vinculado a {orcamento.obra.nome}</p>
          )}
        </div>
        <form action={excluirOrcamento.bind(null, orcamento.id)}>
          <button
            type="submit"
            className="text-xs font-medium text-red-500 hover:underline"
          >
            Excluir orçamento
          </button>
        </form>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">📄 PDF do executivo</p>
        {orcamento.arquivoExecutivo ? (
          <>
            <p className="mt-1 text-xs text-slate-500">
              PDF já anexado a este orçamento.
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
              <a
                href={`/api/arquivos/${orcamento.arquivoExecutivo.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-slate-700 hover:underline"
              >
                📎 {orcamento.arquivoExecutivo.nomeOriginal}
              </a>
              <form action={removerPdfExecutivo.bind(null, orcamento.id)}>
                <button
                  type="submit"
                  className="text-xs font-medium text-red-500 hover:underline"
                >
                  Remover
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-xs text-slate-500">
              Envie o PDF do projeto executivo e a IA extrai as peças e
              medidas automaticamente, já lançando tudo no orçamento — o
              custo sai calculado pelo próprio sistema a partir daí.
            </p>
            <AnalisePdfForm orcamentoId={orcamento.id} />

            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600">
                Prefiro só anexar o PDF, sem análise por IA
              </summary>
              <form
                action={anexarPdfExecutivo.bind(null, orcamento.id)}
                className="mt-2 flex flex-wrap items-center gap-2"
              >
                <input
                  type="file"
                  name="arquivo"
                  accept="application/pdf"
                  required
                  className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Anexar PDF
                </button>
              </form>
            </details>
          </>
        )}
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">Configuração</p>
        <form
          action={atualizarConfigOrcamento.bind(null, orcamento.id)}
          className="mt-3 flex flex-wrap items-end gap-2"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Tipo de cliente (RT)</label>
            <select
              name="tipoCliente"
              defaultValue={orcamento.tipoCliente}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              {TIPO_CLIENTE_ORCAMENTO.map((t) => (
                <option key={t} value={t}>
                  {TIPO_CLIENTE_ORCAMENTO_LABEL[t]} ({Math.round(RT_POR_TIPO_CLIENTE[t] * 100)}%)
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Margem de lucro (%)</label>
            <input
              name="margemPercent"
              type="number"
              step="any"
              min={0}
              defaultValue={Math.round(orcamento.margemPercent * 10000) / 100}
              className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Atualizar
          </button>
        </form>
      </div>

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">Adicionar peça</p>
        {tiposMaterial.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Cadastre materiais na{" "}
            <Link href="/orcamento-ia/materiais" className="underline">
              tabela de preços
            </Link>{" "}
            antes de lançar peças.
          </p>
        ) : (
          <form
            action={adicionarPeca.bind(null, orcamento.id)}
            className="mt-3 flex flex-wrap items-end gap-2"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Nome da peça</label>
              <input
                name="nome"
                placeholder="Ex: Painel superior"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Comprimento (m)</label>
              <input
                name="comprimento"
                type="number"
                step="any"
                min={0}
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Largura (m)</label>
              <input
                name="largura"
                type="number"
                step="any"
                min={0}
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500">Material</label>
              <select
                name="tipoMaterialId"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                {tiposMaterial.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} — {formatBRL(t.valorM2)}/m²
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
            >
              Adicionar
            </button>
          </form>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Peça</th>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Medidas</th>
              <th className="px-4 py-3">M²</th>
              <th className="px-4 py-3">Custo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {pecasComCusto.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma peça lançada ainda.
                </td>
              </tr>
            ) : (
              pecasComCusto.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2.5 text-slate-800">{p.nome}</td>
                  <td className="px-4 py-2.5 text-slate-600">{p.tipoMaterial.nome}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {p.comprimento} × {p.largura} m
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{p.m2.toFixed(2)}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">
                    {formatBRL(p.custo)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <form action={excluirPeca.bind(null, p.id, orcamento.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-500 hover:underline"
                      >
                        Excluir
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card ml-auto flex w-full max-w-sm flex-col gap-2 p-5 sm:w-auto">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Custo total</span>
          <span className="font-medium text-slate-800">{formatBRL(custoTotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            + RT ({TIPO_CLIENTE_ORCAMENTO_LABEL[orcamento.tipoCliente]}, {Math.round(rt * 100)}%)
          </span>
          <span className="font-medium text-slate-800">{formatBRL(custoComRT)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">+ Margem ({Math.round(orcamento.margemPercent * 100)}%)</span>
          <span className="font-medium text-slate-800">{formatBRL(valorFinal)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2 text-base">
          <span className="font-semibold text-slate-900">Valor final</span>
          <span className="font-semibold text-slate-900">{formatBRL(valorFinal)}</span>
        </div>
      </div>
    </div>
  );
}
