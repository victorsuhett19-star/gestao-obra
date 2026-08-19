"use client";

import { useActionState } from "react";
import { registrarPonto } from "@/app/actions/rh";
import { TIPO_REGISTRO_PONTO } from "@/lib/definitions";
import { TIPO_REGISTRO_PONTO_LABEL } from "@/lib/labels";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function PontoForm({ colaboradorId }: { colaboradorId: string }) {
  const [state, action, pending] = useActionState(registrarPonto, undefined);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="colaboradorId" value={colaboradorId} />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Data</label>
        <input
          name="data"
          type="date"
          defaultValue={hoje()}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Tipo</label>
        <select
          name="tipo"
          defaultValue="TRABALHO"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        >
          {TIPO_REGISTRO_PONTO.map((t) => (
            <option key={t} value={t}>
              {TIPO_REGISTRO_PONTO_LABEL[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Entrada</label>
        <input
          name="horaEntrada"
          type="time"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500">Saída</label>
        <input
          name="horaSaida"
          type="time"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
        />
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
        {pending ? "Salvando..." : "Registrar"}
      </button>
      {state?.errors?.data && (
        <p className="w-full text-sm text-red-600">{state.errors.data[0]}</p>
      )}
    </form>
  );
}
