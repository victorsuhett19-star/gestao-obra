"use client";

import { useActionState } from "react";
import { addFolga } from "@/app/actions/rh";
import { TIPO_FOLGA } from "@/lib/definitions";
import { TIPO_FOLGA_LABEL } from "@/lib/labels";

export function FolgaForm({ colaboradorId }: { colaboradorId: string }) {
  const [state, action, pending] = useActionState(addFolga, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="colaboradorId" value={colaboradorId} />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Tipo</label>
        <select
          name="tipo"
          defaultValue="FOLGA"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        >
          {TIPO_FOLGA.map((t) => (
            <option key={t} value={t}>
              {TIPO_FOLGA_LABEL[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Início</label>
        <input
          name="dataInicio"
          type="date"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        {state?.errors?.dataInicio && (
          <p className="text-xs text-red-600">{state.errors.dataInicio[0]}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Fim</label>
        <input
          name="dataFim"
          type="date"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
        {state?.errors?.dataFim && (
          <p className="text-xs text-red-600">{state.errors.dataFim[0]}</p>
        )}
      </div>
      <div className="flex flex-1 min-w-[150px] flex-col gap-1">
        <label className="text-xs text-slate-500">Observação</label>
        <input
          name="observacao"
          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Solicitar"}
      </button>
    </form>
  );
}
