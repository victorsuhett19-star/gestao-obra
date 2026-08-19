"use client";

import { useActionState, useState } from "react";
import { saveEvento } from "@/app/actions/agenda";
import { TIPO_EVENTO } from "@/lib/definitions";
import { TIPO_EVENTO_LABEL } from "@/lib/labels";

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

export function EventoForm({
  obras,
  obraIdFixo,
  voltarPara,
}: {
  obras: { id: string; nome: string }[];
  obraIdFixo?: string;
  voltarPara?: string;
}) {
  const [state, action, pending] = useActionState(saveEvento, undefined);
  const [cor, setCor] = useState(CORES[0]);

  return (
    <form action={action} className="flex flex-col gap-4">
      {obraIdFixo && <input type="hidden" name="obraId" value={obraIdFixo} />}
      {voltarPara && <input type="hidden" name="voltarPara" value={voltarPara} />}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          id="titulo"
          name="titulo"
          placeholder="Ex: Visita técnica, Reunião com cliente..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.titulo && (
          <p className="text-sm text-red-600">{state.errors.titulo[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="data" className="text-sm font-medium text-slate-700">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.data && (
            <p className="text-sm text-red-600">{state.errors.data[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hora" className="text-sm font-medium text-slate-700">
            Hora
          </label>
          <input
            id="hora"
            name="hora"
            type="time"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tipo" className="text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue="REUNIAO"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {TIPO_EVENTO.map((t) => (
              <option key={t} value={t}>
                {TIPO_EVENTO_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Cor no calendário</label>
        <input type="hidden" name="cor" value={cor} />
        <div className="flex flex-wrap gap-2">
          {CORES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCor(c)}
              aria-label={`Cor ${c}`}
              className={`h-7 w-7 rounded-full border-2 ${cor === c ? "border-ink-900" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {!obraIdFixo && (
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
      )}

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
          {pending ? "Salvando..." : "Agendar"}
        </button>
      </div>
    </form>
  );
}
