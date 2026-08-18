"use client";

import { useActionState } from "react";
import { addObjetivo, alternarObjetivo } from "@/app/actions/objetivos";

type Objetivo = { id: string; descricao: string; concluido: boolean };

export function ObjetivosPanel({
  obraId,
  objetivos,
}: {
  obraId: string;
  objetivos: Objetivo[];
}) {
  const [state, action, pending] = useActionState(addObjetivo, undefined);
  const pendentes = objetivos.filter((o) => !o.concluido);
  const concluidos = objetivos.filter((o) => o.concluido);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-900">
        Objetivos — {pendentes.length} pendente(s)
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {objetivos.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhum objetivo cadastrado ainda.
          </p>
        )}
        {[...pendentes, ...concluidos].map((o) => (
          <form
            key={o.id}
            action={alternarObjetivo.bind(null, o.id, obraId)}
            className="flex items-center gap-2"
          >
            <button
              type="submit"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                o.concluido
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-slate-300 text-transparent hover:border-slate-500"
              }`}
              aria-label={o.concluido ? "Reabrir objetivo" : "Concluir objetivo"}
            >
              ✓
            </button>
            <span
              className={`text-sm ${o.concluido ? "text-slate-400 line-through" : "text-slate-800"}`}
            >
              {o.descricao}
            </span>
          </form>
        ))}
      </div>

      <form action={action} className="mt-4 flex gap-2">
        <input type="hidden" name="obraId" value={obraId} />
        <input
          name="descricao"
          placeholder="Ex: Concluir demolição do piso da cozinha"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          + Adicionar
        </button>
      </form>
      {state?.errors?.descricao && (
        <p className="mt-1 text-sm text-red-600">{state.errors.descricao[0]}</p>
      )}
    </div>
  );
}
