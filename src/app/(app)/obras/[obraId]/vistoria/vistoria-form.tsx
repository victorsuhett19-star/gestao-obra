"use client";

import { useActionState, useState } from "react";
import { saveVistoria } from "@/app/actions/vistoria";
import { STATUS_ITEM_VISTORIA } from "@/lib/definitions";
import { STATUS_ITEM_VISTORIA_LABEL } from "@/lib/labels";

let proximoKey = 1;

type Linha = { key: number; ambiente: string; status: string; observacao: string };

export function VistoriaForm({ obraId }: { obraId: string }) {
  const [state, action, pending] = useActionState(saveVistoria, undefined);
  const [itens, setItens] = useState<Linha[]>([
    { key: proximoKey++, ambiente: "", status: "CONCLUIDO_SEM_OCORRENCIA", observacao: "" },
  ]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="obraId" value={obraId} />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">
          Ambientes vistoriados
        </span>
        {itens.map((item) => (
          <div key={item.key} className="rounded-lg border border-slate-200 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                name="itemAmbiente"
                placeholder="Ex: Mesa sem ripado com prateleira"
                value={item.ambiente}
                onChange={(e) =>
                  setItens((prev) =>
                    prev.map((x) => (x.key === item.key ? { ...x, ambiente: e.target.value } : x))
                  )
                }
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
              />
              <select
                name="itemStatus"
                value={item.status}
                onChange={(e) =>
                  setItens((prev) =>
                    prev.map((x) => (x.key === item.key ? { ...x, status: e.target.value } : x))
                  )
                }
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
              >
                {STATUS_ITEM_VISTORIA.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_ITEM_VISTORIA_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
            <input
              name="itemObservacao"
              placeholder="Observação (opcional)"
              value={item.observacao}
              onChange={(e) =>
                setItens((prev) =>
                  prev.map((x) => (x.key === item.key ? { ...x, observacao: e.target.value } : x))
                )
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setItens((prev) => [
              ...prev,
              { key: proximoKey++, ambiente: "", status: "CONCLUIDO_SEM_OCORRENCIA", observacao: "" },
            ])
          }
          className="self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          + Adicionar ambiente
        </button>
        {state?.errors?.itens && (
          <p className="text-sm text-red-600">{state.errors.itens[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="observacoesCliente" className="text-sm font-medium text-slate-700">
          Observações do cliente
        </label>
        <textarea
          id="observacoesCliente"
          name="observacoesCliente"
          rows={3}
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
          className="rounded-lg bg-ink-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Gerar relatório de vistoria"}
        </button>
      </div>
    </form>
  );
}
