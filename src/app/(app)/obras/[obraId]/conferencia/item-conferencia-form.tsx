"use client";

import { useActionState } from "react";
import { saveItemConferencia } from "@/app/actions/conferencia";

export function ItemConferenciaForm({
  obraId,
  usuarios,
}: {
  obraId: string;
  usuarios: { id: string; nome: string }[];
}) {
  const [state, action, pending] = useActionState(saveItemConferencia, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="obraId" value={obraId} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium text-slate-700">
          Ambiente / item
        </label>
        <input
          id="titulo"
          name="titulo"
          placeholder="Ex: Cozinha planejada, Closet do quarto..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.titulo && (
          <p className="text-sm text-red-600">{state.errors.titulo[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="responsavelId" className="text-sm font-medium text-slate-700">
            Responsável
          </label>
          <select
            id="responsavelId"
            name="responsavelId"
            defaultValue=""
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Sem responsável definido</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="prazo" className="text-sm font-medium text-slate-700">
            Prazo
          </label>
          <input
            id="prazo"
            name="prazo"
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="observacoes" className="text-sm font-medium text-slate-700">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={2}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
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
          {pending ? "Salvando..." : "Adicionar ao funil"}
        </button>
      </div>
    </form>
  );
}
