"use client";

import { useActionState } from "react";
import { saveColaborador } from "@/app/actions/colaboradores";

type ColaboradorInicial = {
  id: string;
  nome: string;
  funcao: string | null;
  telefone: string | null;
  fotoUrl: string | null;
};

export function ColaboradorForm({
  colaborador,
}: {
  colaborador?: ColaboradorInicial;
}) {
  const [state, action, pending] = useActionState(saveColaborador, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {colaborador && (
        <input type="hidden" name="colaboradorId" value={colaborador.id} />
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={colaborador?.nome}
          placeholder="Ex: André Luiz"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.nome && (
          <p className="text-sm text-red-600">{state.errors.nome[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="funcao" className="text-sm font-medium text-slate-700">
          Função
        </label>
        <input
          id="funcao"
          name="funcao"
          placeholder="Ex: Montador, Conferente, Mestre de obras..."
          defaultValue={colaborador?.funcao ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="telefone" className="text-sm font-medium text-slate-700">
          Telefone
        </label>
        <input
          id="telefone"
          name="telefone"
          placeholder="(21) 99999-0000"
          defaultValue={colaborador?.telefone ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fotoUrl" className="text-sm font-medium text-slate-700">
          Foto (URL)
        </label>
        <input
          id="fotoUrl"
          name="fotoUrl"
          placeholder="https://..."
          defaultValue={colaborador?.fotoUrl ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        <p className="text-xs text-slate-500">
          Por enquanto aceitamos um link de imagem — upload direto de foto entra
          na fase de fotos/diário de obra.
        </p>
        {state?.errors?.fotoUrl && (
          <p className="text-sm text-red-600">{state.errors.fotoUrl[0]}</p>
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
          {pending
            ? "Salvando..."
            : colaborador
              ? "Salvar alterações"
              : "Cadastrar colaborador"}
        </button>
      </div>
    </form>
  );
}
