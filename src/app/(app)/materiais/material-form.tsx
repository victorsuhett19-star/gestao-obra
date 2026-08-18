"use client";

import { useActionState } from "react";
import { saveMaterial } from "@/app/actions/materiais";

type MaterialInicial = {
  id: string;
  nome: string;
  unidade: string;
  categoria: string | null;
  precoReferencia: number | null;
};

export function MaterialForm({ material }: { material?: MaterialInicial }) {
  const [state, action, pending] = useActionState(saveMaterial, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {material && <input type="hidden" name="materialId" value={material.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-slate-700">
          Nome do material
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={material?.nome}
          placeholder="Ex: MDF branco 18mm"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.nome && (
          <p className="text-sm text-red-600">{state.errors.nome[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="unidade" className="text-sm font-medium text-slate-700">
            Unidade
          </label>
          <input
            id="unidade"
            name="unidade"
            placeholder="chapa, un, m²..."
            defaultValue={material?.unidade ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.unidade && (
            <p className="text-sm text-red-600">{state.errors.unidade[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria" className="text-sm font-medium text-slate-700">
            Categoria
          </label>
          <input
            id="categoria"
            name="categoria"
            placeholder="Chapas, Ferragens..."
            defaultValue={material?.categoria ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="precoReferencia"
            className="text-sm font-medium text-slate-700"
          >
            Preço de referência (R$)
          </label>
          <input
            id="precoReferencia"
            name="precoReferencia"
            type="number"
            step="any"
            min={0}
            defaultValue={material?.precoReferencia ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
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
            : material
              ? "Salvar alterações"
              : "Cadastrar material"}
        </button>
      </div>
    </form>
  );
}
