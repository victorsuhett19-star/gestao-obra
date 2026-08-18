"use client";

import { useActionState, useState } from "react";
import { savePedido } from "@/app/actions/pedidos";

type Linha = { key: number; materialId: string; quantidade: string; valorUnitario: string };

let proximoKey = 1;

export function PedidoForm({
  obraId,
  fornecedores,
  materiais,
}: {
  obraId: string;
  fornecedores: { id: string; nome: string }[];
  materiais: { id: string; nome: string; unidade: string; precoReferencia: number | null }[];
}) {
  const [state, action, pending] = useActionState(savePedido, undefined);
  const [linhas, setLinhas] = useState<Linha[]>([
    { key: proximoKey++, materialId: "", quantidade: "1", valorUnitario: "" },
  ]);

  function adicionarLinha() {
    setLinhas((prev) => [
      ...prev,
      { key: proximoKey++, materialId: "", quantidade: "1", valorUnitario: "" },
    ]);
  }

  function removerLinha(key: number) {
    setLinhas((prev) => prev.filter((l) => l.key !== key));
  }

  function atualizarLinha(key: number, campo: keyof Linha, valor: string) {
    setLinhas((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const atualizada = { ...l, [campo]: valor };
        if (campo === "materialId") {
          const material = materiais.find((m) => m.id === valor);
          if (material?.precoReferencia && !l.valorUnitario) {
            atualizada.valorUnitario = String(material.precoReferencia);
          }
        }
        return atualizada;
      })
    );
  }

  const total = linhas.reduce(
    (acc, l) => acc + Number(l.quantidade || 0) * Number(l.valorUnitario || 0),
    0
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="obraId" value={obraId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fornecedorId" className="text-sm font-medium text-slate-700">
            Fornecedor
          </label>
          <select
            id="fornecedorId"
            name="fornecedorId"
            defaultValue=""
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="" disabled>
              Selecione um fornecedor
            </option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
          {state?.errors?.fornecedorId && (
            <p className="text-sm text-red-600">{state.errors.fornecedorId[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dataEntregaPrevista"
            className="text-sm font-medium text-slate-700"
          >
            Entrega prevista
          </label>
          <input
            id="dataEntregaPrevista"
            name="dataEntregaPrevista"
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700">Itens do pedido</span>

        <div className="flex flex-col gap-2">
          {linhas.map((linha) => (
            <div
              key={linha.key}
              className="grid grid-cols-[1fr_90px_120px_auto] items-end gap-2 rounded-lg border border-slate-200 p-2"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Material</label>
                <select
                  name="itemMaterialId"
                  value={linha.materialId}
                  onChange={(e) => atualizarLinha(linha.key, "materialId", e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Selecione...</option>
                  {materiais.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.unidade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Qtd.</label>
                <input
                  name="itemQuantidade"
                  type="number"
                  step="any"
                  min={0}
                  value={linha.quantidade}
                  onChange={(e) => atualizarLinha(linha.key, "quantidade", e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Vlr. unit. (R$)</label>
                <input
                  name="itemValorUnitario"
                  type="number"
                  step="any"
                  min={0}
                  value={linha.valorUnitario}
                  onChange={(e) =>
                    atualizarLinha(linha.key, "valorUnitario", e.target.value)
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="button"
                onClick={() => removerLinha(linha.key)}
                disabled={linhas.length === 1}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:underline disabled:opacity-30"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={adicionarLinha}
          className="self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          + Adicionar item
        </button>

        {state?.errors?.itens && (
          <p className="text-sm text-red-600">{state.errors.itens[0]}</p>
        )}
      </div>

      <p className="text-sm text-slate-600">
        Total do pedido:{" "}
        <span className="font-semibold text-slate-900">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(total)}
        </span>
      </p>

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
          {pending ? "Salvando..." : "Criar pedido"}
        </button>
      </div>
    </form>
  );
}
