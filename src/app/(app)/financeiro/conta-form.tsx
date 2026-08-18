"use client";

import { useActionState } from "react";
import { saveContaFinanceira } from "@/app/actions/financeiro-empresa";
import { TIPO_CONTA_FINANCEIRA } from "@/lib/definitions";
import { TIPO_CONTA_FINANCEIRA_LABEL } from "@/lib/labels";

export function ContaForm({
  fornecedores,
  obras,
}: {
  fornecedores: { id: string; nome: string }[];
  obras: { id: string; nome: string }[];
}) {
  const [state, action, pending] = useActionState(saveContaFinanceira, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricao" className="text-sm font-medium text-slate-700">
          Descrição
        </label>
        <input
          id="descricao"
          name="descricao"
          placeholder="Ex: Aluguel do galpão, Pagamento cliente X..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.descricao && (
          <p className="text-sm text-red-600">{state.errors.descricao[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tipo" className="text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue="PAGAR"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {TIPO_CONTA_FINANCEIRA.map((t) => (
              <option key={t} value={t}>
                {TIPO_CONTA_FINANCEIRA_LABEL[t]}
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
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.valor && (
            <p className="text-sm text-red-600">{state.errors.valor[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dataVencimento" className="text-sm font-medium text-slate-700">
            Vencimento
          </label>
          <input
            id="dataVencimento"
            name="dataVencimento"
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.dataVencimento && (
            <p className="text-sm text-red-600">{state.errors.dataVencimento[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria" className="text-sm font-medium text-slate-700">
            Categoria
          </label>
          <input
            id="categoria"
            name="categoria"
            placeholder="Ex: Aluguel, Salários, Cliente..."
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="fornecedorId" className="text-sm font-medium text-slate-700">
            Fornecedor (opcional)
          </label>
          <select
            id="fornecedorId"
            name="fornecedorId"
            defaultValue=""
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Nenhum</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="obraId" className="text-sm font-medium text-slate-700">
            Obra relacionada (opcional)
          </label>
          <select
            id="obraId"
            name="obraId"
            defaultValue=""
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Nenhuma</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
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
          {pending ? "Salvando..." : "Lançar conta"}
        </button>
      </div>
    </form>
  );
}
