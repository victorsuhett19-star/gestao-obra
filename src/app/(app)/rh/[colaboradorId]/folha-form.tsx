"use client";

import { useActionState } from "react";
import { addFolha } from "@/app/actions/rh";

function mesAtual() {
  return new Date().toISOString().slice(0, 7);
}

export function FolhaForm({ colaboradorId }: { colaboradorId: string }) {
  const [state, action, pending] = useActionState(addFolha, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="colaboradorId" value={colaboradorId} />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Mês (AAAA-MM)</label>
        <input
          name="mesReferencia"
          type="month"
          defaultValue={mesAtual()}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        {state?.errors?.mesReferencia && (
          <p className="text-xs text-red-600">{state.errors.mesReferencia[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Salário base (R$)</label>
        <input
          name="salarioBase"
          type="number"
          step="any"
          min={0}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        {state?.errors?.salarioBase && (
          <p className="text-xs text-red-600">{state.errors.salarioBase[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Descontos (R$)</label>
        <input
          name="descontos"
          type="number"
          step="any"
          min={0}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Lançar folha"}
      </button>
    </form>
  );
}
