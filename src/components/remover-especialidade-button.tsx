"use client";

import { useState } from "react";
import { removerEspecialidade } from "@/app/actions/projetos";

export function RemoverEspecialidadeButton({
  obraId,
  obraTradeId,
  nome,
}: {
  obraId: string;
  obraTradeId: string;
  nome: string;
}) {
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-slate-500">Remover {nome}?</span>
        <form action={removerEspecialidade.bind(null, obraId, obraTradeId)}>
          <button type="submit" className="font-semibold text-red-600 hover:underline">
            Sim
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="font-medium text-slate-400 hover:underline"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="text-xs font-medium text-red-500 hover:underline"
    >
      Excluir
    </button>
  );
}
