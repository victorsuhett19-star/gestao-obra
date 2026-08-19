"use client";

import { useActionState } from "react";
import { saveItemOrcamento } from "@/app/actions/orcamento";
import { CATEGORIA_ORCAMENTO } from "@/lib/definitions";
import { CATEGORIA_ORCAMENTO_LABEL } from "@/lib/labels";

type ItemInicial = {
  id: string;
  etapaId: string | null;
  categoria: string;
  descricao: string;
  unidade: string | null;
  quantidade: number;
  valorUnitario: number;
};

export function ItemOrcamentoForm({
  obraId,
  etapas,
  item,
  voltarPara,
}: {
  obraId: string;
  etapas: { id: string; nome: string }[];
  item?: ItemInicial;
  voltarPara?: string;
}) {
  const [state, action, pending] = useActionState(saveItemOrcamento, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="obraId" value={obraId} />
      {voltarPara && <input type="hidden" name="voltarPara" value={voltarPara} />}
      {item && <input type="hidden" name="itemId" value={item.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricao" className="text-sm font-medium text-slate-700">
          Descrição
        </label>
        <input
          id="descricao"
          name="descricao"
          defaultValue={item?.descricao}
          placeholder="Ex: MDF branco 18mm, Mão de obra montagem cozinha..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.descricao && (
          <p className="text-sm text-red-600">{state.errors.descricao[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria" className="text-sm font-medium text-slate-700">
            Categoria
          </label>
          <select
            id="categoria"
            name="categoria"
            defaultValue={item?.categoria ?? "OUTROS"}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {CATEGORIA_ORCAMENTO.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_ORCAMENTO_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="unidade" className="text-sm font-medium text-slate-700">
            Unidade
          </label>
          <input
            id="unidade"
            name="unidade"
            placeholder="un, m², kg..."
            defaultValue={item?.unidade ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="quantidade" className="text-sm font-medium text-slate-700">
            Quantidade
          </label>
          <input
            id="quantidade"
            name="quantidade"
            type="number"
            step="any"
            min={0}
            defaultValue={item?.quantidade ?? 1}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.quantidade && (
            <p className="text-sm text-red-600">{state.errors.quantidade[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="valorUnitario" className="text-sm font-medium text-slate-700">
            Valor unitário (R$)
          </label>
          <input
            id="valorUnitario"
            name="valorUnitario"
            type="number"
            step="any"
            min={0}
            defaultValue={item?.valorUnitario ?? 0}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.valorUnitario && (
            <p className="text-sm text-red-600">{state.errors.valorUnitario[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="etapaId" className="text-sm font-medium text-slate-700">
          Etapa relacionada (opcional)
        </label>
        <select
          id="etapaId"
          name="etapaId"
          defaultValue={item?.etapaId ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Nenhuma</option>
          {etapas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      </div>

      {state?.message && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : item ? "Salvar alterações" : "Adicionar item"}
        </button>
      </div>
    </form>
  );
}
