import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getEmpresaAtivaId } from "@/lib/empresa";
import { BackLink } from "@/components/back-link";
import {
  salvarTipoMaterial,
  excluirTipoMaterial,
  importarTiposMaterialPadrao,
} from "@/app/actions/orcamento-ia";
import { formatBRL } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Tabela de preços — VS Gestão de Obra",
};

export default async function MateriaisOrcamentoIAPage() {
  const empresaAtivaId = await getEmpresaAtivaId();

  const tipos = await prisma.tipoMaterialOrcamento.findMany({
    where: { empresaId: empresaAtivaId ?? undefined },
    orderBy: { ordem: "asc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <BackLink href="/orcamento-ia" label="Orçamento IA" />
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          Tabela de preços
        </h1>
        <p className="text-sm text-slate-500">
          Preço por m² de cada material, mais os percentuais de ferragem e
          complexidade usados no cálculo do custo das peças.
        </p>
      </div>

      {tipos.length === 0 && (
        <div className="card p-5">
          <p className="text-sm text-slate-600">
            Nenhum material cadastrado ainda. Você pode importar a tabela
            padrão enviada (MDF, Fórmica, Pinus, vidros, mármores, etc.) e
            editar os valores depois.
          </p>
          <form action={importarTiposMaterialPadrao} className="mt-3">
            <button
              type="submit"
              className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
            >
              Importar tabela padrão
            </button>
          </form>
        </div>
      )}

      <div className="card p-5">
        <p className="text-sm font-semibold text-slate-800">
          Novo material / atualizar preço
        </p>
        <form action={salvarTipoMaterial} className="mt-3 flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Nome</label>
            <input
              name="nome"
              placeholder="Ex: MDF Branco"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Valor do m² (R$)</label>
            <input
              name="valorM2"
              type="number"
              step="any"
              min={0}
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Ferragem (%)</label>
            <input
              name="ferragemPercent"
              type="number"
              step="any"
              min={0}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500">Complexidade (%)</label>
            <input
              name="complexidadePercent"
              type="number"
              step="any"
              min={0}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700"
          >
            Salvar
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Valor m²</th>
              <th className="px-4 py-3">Ferragem</th>
              <th className="px-4 py-3">Complexidade</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {tipos.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 text-slate-800">{t.nome}</td>
                <td className="px-4 py-2.5 text-slate-600">{formatBRL(t.valorM2)}</td>
                <td className="px-4 py-2.5 text-slate-600">
                  {Math.round(t.ferragemPercent * 100)}%
                </td>
                <td className="px-4 py-2.5 text-slate-600">
                  {Math.round(t.complexidadePercent * 100)}%
                </td>
                <td className="px-4 py-2.5 text-right">
                  <form action={excluirTipoMaterial.bind(null, t.id)}>
                    <button
                      type="submit"
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
