"use client";

import { useActionState } from "react";
import { saveObra } from "@/app/actions/obras";
import { STATUS_OBRA, TRADES } from "@/lib/definitions";
import { STATUS_OBRA_LABEL, TRADE_LABEL } from "@/lib/labels";

type ObraInicial = {
  id: string;
  nome: string;
  endereco: string | null;
  clienteNome: string | null;
  clienteTelefone: string | null;
  clienteEmail: string | null;
  clienteCpfCnpj: string | null;
  descricao: string | null;
  condicoesPagamento: string | null;
  prazoExecucaoDias: number | null;
  status: string;
  dataInicioPrevista: Date | null;
  dataFimPrevista: Date | null;
  trades: string[];
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function ObraForm({ obra }: { obra?: ObraInicial }) {
  const [state, action, pending] = useActionState(saveObra, undefined);

  return (
    <form action={action} className="flex flex-col gap-6">
      {obra && <input type="hidden" name="obraId" value={obra.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="nome" className="text-sm font-medium text-slate-700">
            Nome da obra
          </label>
          <input
            id="nome"
            name="nome"
            defaultValue={obra?.nome}
            placeholder="Ex: Residência Silva — cozinha e closet"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.nome && (
            <p className="text-sm text-red-600">{state.errors.nome[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="endereco" className="text-sm font-medium text-slate-700">
            Endereço
          </label>
          <input
            id="endereco"
            name="endereco"
            defaultValue={obra?.endereco ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="clienteNome" className="text-sm font-medium text-slate-700">
            Cliente
          </label>
          <input
            id="clienteNome"
            name="clienteNome"
            defaultValue={obra?.clienteNome ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="clienteCpfCnpj" className="text-sm font-medium text-slate-700">
            CPF/CNPJ do cliente
          </label>
          <input
            id="clienteCpfCnpj"
            name="clienteCpfCnpj"
            defaultValue={obra?.clienteCpfCnpj ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="clienteTelefone" className="text-sm font-medium text-slate-700">
            Telefone do cliente
          </label>
          <input
            id="clienteTelefone"
            name="clienteTelefone"
            placeholder="(21) 99999-0000"
            defaultValue={obra?.clienteTelefone ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="clienteEmail" className="text-sm font-medium text-slate-700">
            E-mail do cliente
          </label>
          <input
            id="clienteEmail"
            name="clienteEmail"
            type="email"
            defaultValue={obra?.clienteEmail ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.clienteEmail && (
            <p className="text-sm text-red-600">{state.errors.clienteEmail[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="descricao" className="text-sm font-medium text-slate-700">
            Descrição do serviço
          </label>
          <textarea
            id="descricao"
            name="descricao"
            rows={2}
            placeholder="Ex: Reforma de cozinha"
            defaultValue={obra?.descricao ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="condicoesPagamento"
            className="text-sm font-medium text-slate-700"
          >
            Condições de pagamento
          </label>
          <input
            id="condicoesPagamento"
            name="condicoesPagamento"
            placeholder="Ex: 50% na assinatura, 50% na entrega"
            defaultValue={obra?.condicoesPagamento ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={obra?.status ?? "PLANEJAMENTO"}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {STATUS_OBRA.map((status) => (
              <option key={status} value={status}>
                {STATUS_OBRA_LABEL[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="prazoExecucaoDias"
            className="text-sm font-medium text-slate-700"
          >
            Prazo de execução (dias)
          </label>
          <input
            id="prazoExecucaoDias"
            name="prazoExecucaoDias"
            type="number"
            min={0}
            defaultValue={obra?.prazoExecucaoDias ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dataInicioPrevista"
            className="text-sm font-medium text-slate-700"
          >
            Início previsto
          </label>
          <input
            id="dataInicioPrevista"
            name="dataInicioPrevista"
            type="date"
            defaultValue={toDateInputValue(obra?.dataInicioPrevista ?? null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dataFimPrevista"
            className="text-sm font-medium text-slate-700"
          >
            Fim previsto
          </label>
          <input
            id="dataFimPrevista"
            name="dataFimPrevista"
            type="date"
            defaultValue={toDateInputValue(obra?.dataFimPrevista ?? null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">
          Especialidades envolvidas
        </span>
        <div className="flex flex-wrap gap-3">
          {TRADES.map((trade) => (
            <label
              key={trade}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
            >
              <input
                type="checkbox"
                name="trades"
                value={trade}
                defaultChecked={obra?.trades.includes(trade)}
                className="accent-slate-900"
              />
              {TRADE_LABEL[trade]}
            </label>
          ))}
        </div>
        {state?.errors?.trades && (
          <p className="text-sm text-red-600">{state.errors.trades[0]}</p>
        )}
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
          {pending ? "Salvando..." : obra ? "Salvar alterações" : "Criar obra"}
        </button>
      </div>
    </form>
  );
}
