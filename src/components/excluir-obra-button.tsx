"use client";

import { excluirObra } from "@/app/actions/obras";

export function ExcluirObraButton({ obraId, nome }: { obraId: string; nome: string }) {
  return (
    <form
      action={excluirObra.bind(null, obraId)}
      onSubmit={(e) => {
        if (
          !confirm(
            `Excluir "${nome}"? Isso apaga também cronograma, orçamento, financeiro, tarefas, diário e anexos dessa obra. Não tem como desfazer.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-xs font-medium text-red-500 hover:underline"
      >
        Excluir
      </button>
    </form>
  );
}
