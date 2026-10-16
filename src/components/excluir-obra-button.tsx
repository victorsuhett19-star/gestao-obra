"use client";

import { useState } from "react";
import { excluirObra } from "@/app/actions/obras";

export function ExcluirObraButton({ obraId, nome }: { obraId: string; nome: string }) {
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-slate-500">Excluir &quot;{nome}&quot;?</span>
        <form action={excluirObra.bind(null, obraId)}>
          <button type="submit" className="font-semibold text-red-600 hover:underline">
            Sim, excluir
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="font-medium text-slate-400 hover:underline"
        >
          Cancelar
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
