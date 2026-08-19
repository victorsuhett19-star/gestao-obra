"use client";

import { useActionState, useState } from "react";
import { saveAtendimento } from "@/app/actions/atendimento";
import { ORIGEM_ATENDIMENTO } from "@/lib/definitions";
import { ORIGEM_ATENDIMENTO_LABEL } from "@/lib/labels";

type AtendimentoInicial = {
  id: string;
  nomeCliente: string;
  telefone: string | null;
  email: string | null;
  ambienteDesejado: string | null;
  origem: string;
  vendedorId: string | null;
  valorEstimado: number | null;
  cor: string | null;
};

const CORES = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#64748b",
];

export function AtendimentoForm({
  usuarios,
  atendimento,
}: {
  usuarios: { id: string; nome: string }[];
  atendimento?: AtendimentoInicial;
}) {
  const [state, action, pending] = useActionState(saveAtendimento, undefined);
  const [cor, setCor] = useState<string | null>(atendimento?.cor ?? null);

  return (
    <form action={action} className="flex flex-col gap-4">
      {atendimento && (
        <input type="hidden" name="atendimentoId" value={atendimento.id} />
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nomeCliente" className="text-sm font-medium text-slate-700">
          Nome do cliente
        </label>
        <input
          id="nomeCliente"
          name="nomeCliente"
          defaultValue={atendimento?.nomeCliente}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.nomeCliente && (
          <p className="text-sm text-red-600">{state.errors.nomeCliente[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefone" className="text-sm font-medium text-slate-700">
            Telefone / WhatsApp
          </label>
          <input
            id="telefone"
            name="telefone"
            placeholder="(21) 99999-0000"
            defaultValue={atendimento?.telefone ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={atendimento?.email ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.email && (
            <p className="text-sm text-red-600">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ambienteDesejado" className="text-sm font-medium text-slate-700">
            Ambiente desejado
          </label>
          <input
            id="ambienteDesejado"
            name="ambienteDesejado"
            placeholder="Ex: Cozinha, Quarto casal..."
            defaultValue={atendimento?.ambienteDesejado ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="valorEstimado" className="text-sm font-medium text-slate-700">
            Valor estimado (R$)
          </label>
          <input
            id="valorEstimado"
            name="valorEstimado"
            type="number"
            step="any"
            min={0}
            defaultValue={atendimento?.valorEstimado ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="origem" className="text-sm font-medium text-slate-700">
            Origem
          </label>
          <select
            id="origem"
            name="origem"
            defaultValue={atendimento?.origem ?? "LEAD"}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {ORIGEM_ATENDIMENTO.map((o) => (
              <option key={o} value={o}>
                {ORIGEM_ATENDIMENTO_LABEL[o]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vendedorId" className="text-sm font-medium text-slate-700">
            Vendedor
          </label>
          <select
            id="vendedorId"
            name="vendedorId"
            defaultValue={atendimento?.vendedorId ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Não definido</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">
          Cor no quadro (opcional)
        </label>
        <input type="hidden" name="cor" value={cor ?? ""} />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCor(null)}
            aria-label="Sem cor"
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs text-slate-400 ${cor === null ? "border-slate-900" : "border-slate-200"}`}
          >
            ✕
          </button>
          {CORES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCor(c)}
              aria-label={`Cor ${c}`}
              className={`h-7 w-7 rounded-full border-2 ${cor === c ? "border-slate-900" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
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
            : atendimento
              ? "Salvar alterações"
              : "Criar atendimento"}
        </button>
      </div>
    </form>
  );
}
