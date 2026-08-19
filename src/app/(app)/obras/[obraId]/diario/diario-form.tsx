"use client";

import { useActionState } from "react";
import { saveDiario } from "@/app/actions/diario";
import { CLIMA } from "@/lib/definitions";
import { CLIMA_LABEL } from "@/lib/labels";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function DiarioForm({
  obraId,
  colaboradores,
}: {
  obraId: string;
  colaboradores: { id: string; nome: string; funcao: string | null }[];
}) {
  const [state, action, pending] = useActionState(saveDiario, undefined);

  return (
    <form action={action} className="flex flex-col gap-4" encType="multipart/form-data">
      <input type="hidden" name="obraId" value={obraId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="data" className="text-sm font-medium text-slate-700">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={hoje()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.data && (
            <p className="text-sm text-red-600">{state.errors.data[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="clima" className="text-sm font-medium text-slate-700">
            Clima (justifica atrasos)
          </label>
          <select
            id="clima"
            name="clima"
            defaultValue=""
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Não informado</option>
            {CLIMA.map((c) => (
              <option key={c} value={c}>
                {CLIMA_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="terceirizados" className="text-sm font-medium text-slate-700">
          Terceirizados / observações da equipe
        </label>
        <input
          id="terceirizados"
          name="terceirizados"
          placeholder="Ex: eletricista terceirizado da empresa X"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">
          Quem trabalhou hoje
        </span>
        {colaboradores.length === 0 ? (
          <p className="text-sm text-amber-600">
            Nenhum colaborador cadastrado — cadastre em &quot;Colaboradores&quot;
            no menu lateral.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {colaboradores.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 has-checked:border-ink-900 has-checked:bg-ink-900 has-checked:text-white"
              >
                <input
                  type="checkbox"
                  name="colaboradorIds"
                  value={c.id}
                  className="accent-ink-900"
                />
                {c.nome}
                {c.funcao && ` (${c.funcao})`}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="atividadesRealizadas"
          className="text-sm font-medium text-slate-700"
        >
          O que foi feito
        </label>
        <textarea
          id="atividadesRealizadas"
          name="atividadesRealizadas"
          rows={3}
          placeholder="Serviços executados hoje..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.atividadesRealizadas && (
          <p className="text-sm text-red-600">
            {state.errors.atividadesRealizadas[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="necessidades" className="text-sm font-medium text-slate-700">
          Necessidades
        </label>
        <textarea
          id="necessidades"
          name="necessidades"
          rows={2}
          placeholder="Materiais faltando, pendências, problemas encontrados..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fotos" className="text-sm font-medium text-slate-700">
          Fotos
        </label>
        <input
          id="fotos"
          name="fotos"
          type="file"
          accept="image/*"
          multiple
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-medium"
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
          className="rounded-lg bg-ink-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Registrar dia"}
        </button>
      </div>
    </form>
  );
}
