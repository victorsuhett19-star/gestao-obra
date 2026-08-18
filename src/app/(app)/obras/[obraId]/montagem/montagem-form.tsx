"use client";

import { useActionState, useState } from "react";
import { saveMontagem } from "@/app/actions/montagem";

let proximoKey = 1;

type LinhaAmbiente = {
  key: number;
  nome: string;
  numeroPedido: string;
  notaFiscal: string;
  qtdVolumes: string;
  valor: string;
};
type LinhaExtra = { key: number; descricao: string; quantidade: string };
type LinhaFalta = { key: number; numeroPedido: string; numeroVolume: string };

export function MontagemForm({
  obraId,
  montadores,
}: {
  obraId: string;
  montadores: { id: string; nome: string }[];
}) {
  const [state, action, pending] = useActionState(saveMontagem, undefined);

  const [ambientes, setAmbientes] = useState<LinhaAmbiente[]>([
    { key: proximoKey++, nome: "", numeroPedido: "", notaFiscal: "", qtdVolumes: "", valor: "" },
  ]);
  const [extras, setExtras] = useState<LinhaExtra[]>([]);
  const [semExtras, setSemExtras] = useState(false);
  const [faltas, setFaltas] = useState<LinhaFalta[]>([]);
  const [semFaltas, setSemFaltas] = useState(false);

  const total = ambientes.reduce((acc, a) => acc + Number(a.valor || 0), 0);

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="obraId" value={obraId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="montadorId" className="text-sm font-medium text-slate-700">
            Equipe / montador responsável
          </label>
          <select
            id="montadorId"
            name="montadorId"
            defaultValue=""
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Não definido</option>
            {montadores.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dataChegada" className="text-sm font-medium text-slate-700">
            Data de chegada
          </label>
          <input
            id="dataChegada"
            name="dataChegada"
            type="date"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-800">
          Ambientes e valores de contrato
        </p>
        <p className="text-xs text-slate-500">
          Adicione cada ambiente com seu número de pedido, nota fiscal e valor.
        </p>
        {ambientes.map((a) => (
          <div
            key={a.key}
            className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-2 sm:grid-cols-5"
          >
            <input
              name="ambienteNome"
              placeholder="Nome do ambiente"
              value={a.nome}
              onChange={(e) =>
                setAmbientes((prev) =>
                  prev.map((x) => (x.key === a.key ? { ...x, nome: e.target.value } : x))
                )
              }
              className="col-span-2 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500 sm:col-span-1"
            />
            <input
              name="ambientePedido"
              placeholder="Nº pedido"
              value={a.numeroPedido}
              onChange={(e) =>
                setAmbientes((prev) =>
                  prev.map((x) => (x.key === a.key ? { ...x, numeroPedido: e.target.value } : x))
                )
              }
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
            <input
              name="ambienteNotaFiscal"
              placeholder="Nota fiscal"
              value={a.notaFiscal}
              onChange={(e) =>
                setAmbientes((prev) =>
                  prev.map((x) => (x.key === a.key ? { ...x, notaFiscal: e.target.value } : x))
                )
              }
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
            <input
              name="ambienteVolumes"
              type="number"
              placeholder="Qtd. volumes"
              value={a.qtdVolumes}
              onChange={(e) =>
                setAmbientes((prev) =>
                  prev.map((x) => (x.key === a.key ? { ...x, qtdVolumes: e.target.value } : x))
                )
              }
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
            <input
              name="ambienteValor"
              type="number"
              step="any"
              placeholder="Valor (R$)"
              value={a.valor}
              onChange={(e) =>
                setAmbientes((prev) =>
                  prev.map((x) => (x.key === a.key ? { ...x, valor: e.target.value } : x))
                )
              }
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setAmbientes((prev) => [
              ...prev,
              { key: proximoKey++, nome: "", numeroPedido: "", notaFiscal: "", qtdVolumes: "", valor: "" },
            ])
          }
          className="self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          + Adicionar ambiente
        </button>
        {state?.errors?.ambientes && (
          <p className="text-sm text-red-600">{state.errors.ambientes[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">
            Itens extras (compras por fora)
          </p>
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={semExtras}
              onChange={(e) => setSemExtras(e.target.checked)}
            />
            Sem itens extras
          </label>
        </div>
        {!semExtras && (
          <>
            {extras.map((ex) => (
              <div key={ex.key} className="grid grid-cols-3 gap-2">
                <input
                  name="itemExtraDescricao"
                  placeholder="Ex: Puxador inox 128mm"
                  value={ex.descricao}
                  onChange={(e) =>
                    setExtras((prev) =>
                      prev.map((x) => (x.key === ex.key ? { ...x, descricao: e.target.value } : x))
                    )
                  }
                  className="col-span-2 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                />
                <input
                  name="itemExtraQuantidade"
                  type="number"
                  placeholder="Qtd."
                  value={ex.quantidade}
                  onChange={(e) =>
                    setExtras((prev) =>
                      prev.map((x) => (x.key === ex.key ? { ...x, quantidade: e.target.value } : x))
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setExtras((prev) => [...prev, { key: proximoKey++, descricao: "", quantidade: "1" }])
              }
              className="self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              + Adicionar item extra
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">
            Faltas de fábrica (antecipadas)
          </p>
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={semFaltas}
              onChange={(e) => setSemFaltas(e.target.checked)}
            />
            Sem falta de fábrica
          </label>
        </div>
        {!semFaltas && (
          <>
            {faltas.map((f) => (
              <div key={f.key} className="grid grid-cols-2 gap-2">
                <input
                  name="faltaPedido"
                  placeholder="Nº do pedido"
                  value={f.numeroPedido}
                  onChange={(e) =>
                    setFaltas((prev) =>
                      prev.map((x) => (x.key === f.key ? { ...x, numeroPedido: e.target.value } : x))
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                />
                <input
                  name="faltaVolume"
                  placeholder="Nº do volume"
                  value={f.numeroVolume}
                  onChange={(e) =>
                    setFaltas((prev) =>
                      prev.map((x) => (x.key === f.key ? { ...x, numeroVolume: e.target.value } : x))
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFaltas((prev) => [...prev, { key: proximoKey++, numeroPedido: "", numeroVolume: "" }])
              }
              className="self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              + Adicionar falta de fábrica
            </button>
          </>
        )}
      </div>

      <p className="text-sm text-slate-600">
        Total:{" "}
        <span className="font-semibold text-slate-900">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
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
          {pending ? "Salvando..." : "Registrar e distribuir para equipe"}
        </button>
      </div>
    </form>
  );
}
