"use client";

import { useActionState } from "react";
import { saveLancamento } from "@/app/actions/financeiro";
import { TIPO_LANCAMENTO } from "@/lib/definitions";
import { TIPO_LANCAMENTO_LABEL } from "@/lib/labels";

type LancamentoInicial = {
  id: string;
  itemOrcamentoId: string | null;
  tipo: string;
  categoria: string | null;
  descricao: string;
  valor: number;
  data: Date;
  formaPagamento: string | null;
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function LancamentoForm({
  obraId,
  itensOrcamento,
  lancamento,
}: {
  obraId: string;
  itensOrcamento: { id: string; descricao: string }[];
  lancamento?: LancamentoInicial;
}) {
  const [state, action, pending] = useActionState(saveLancamento, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="obraId" value={obraId} />
      {lancamento && (
        <input type="hidden" name="lancamentoId" value={lancamento.id} />
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricao" className="text-sm font-medium text-slate-700">
          Descrição
        </label>
        <input
          id="descricao"
          name="descricao"
          defaultValue={lancamento?.descricao}
          placeholder="Ex: Compra de MDF, Pagamento de entrada..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.descricao && (
          <p className="text-sm text-red-600">{state.errors.descricao[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tipo" className="text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={lancamento?.tipo ?? "CUSTO"}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {TIPO_LANCAMENTO.map((t) => (
              <option key={t} value={t}>
                {TIPO_LANCAMENTO_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="valor" className="text-sm font-medium text-slate-700">
            Valor (R$)
          </label>
          <input
            id="valor"
            name="valor"
            type="number"
            step="any"
            min={0}
            defaultValue={lancamento?.valor ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.valor && (
            <p className="text-sm text-red-600">{state.errors.valor[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="data" className="text-sm font-medium text-slate-700">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={
              lancamento ? toDateInputValue(lancamento.data) : toDateInputValue(new Date())
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.data && (
            <p className="text-sm text-red-600">{state.errors.data[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria" className="text-sm font-medium text-slate-700">
            Categoria (opcional)
          </label>
          <input
            id="categoria"
            name="categoria"
            placeholder="Ex: Material, Transporte..."
            defaultValue={lancamento?.categoria ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="formaPagamento"
            className="text-sm font-medium text-slate-700"
          >
            Forma de pagamento
          </label>
          <input
            id="formaPagamento"
            name="formaPagamento"
            placeholder="Pix, boleto, cartão..."
            defaultValue={lancamento?.formaPagamento ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="itemOrcamentoId"
            className="text-sm font-medium text-slate-700"
          >
            Item de orçamento (opcional)
          </label>
          <select
            id="itemOrcamentoId"
            name="itemOrcamentoId"
            defaultValue={lancamento?.itemOrcamentoId ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Nenhum</option>
            {itensOrcamento.map((i) => (
              <option key={i.id} value={i.id}>
                {i.descricao}
              </option>
            ))}
          </select>
        </div>
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
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {pending
            ? "Salvando..."
            : lancamento
              ? "Salvar alterações"
              : "Lançar"}
        </button>
      </div>
    </form>
  );
}
