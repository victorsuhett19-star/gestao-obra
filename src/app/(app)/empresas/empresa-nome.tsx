"use client";

import { useState } from "react";
import { editarEmpresa } from "@/app/actions/empresa";

export function EmpresaNome({
  empresaId,
  nome,
  podeEditar,
}: {
  empresaId: string;
  nome: string;
  podeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);

  if (!podeEditar) {
    return <p className="text-sm font-semibold text-slate-900">{nome}</p>;
  }

  if (!editando) {
    return (
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-900">{nome}</p>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline"
        >
          Editar
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await editarEmpresa(empresaId, formData);
        setEditando(false);
      }}
      className="flex items-center gap-2"
    >
      <input
        name="nome"
        defaultValue={nome}
        autoFocus
        className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
      />
      <button
        type="submit"
        className="text-xs font-medium text-emerald-600 hover:underline"
      >
        Salvar
      </button>
      <button
        type="button"
        onClick={() => setEditando(false)}
        className="text-xs font-medium text-slate-500 hover:underline"
      >
        Cancelar
      </button>
    </form>
  );
}
