"use client";

import { useActionState } from "react";
import { saveEtapa } from "@/app/actions/etapas";
import { STATUS_ETAPA } from "@/lib/definitions";
import { STATUS_ETAPA_LABEL } from "@/lib/labels";
import type { EtapaTreeNode } from "@/lib/etapa-tree";

type EtapaInicial = {
  id: string;
  paiId: string | null;
  nome: string;
  status: string;
  percentualConcluido: number;
  dataInicioPrevista: Date | null;
  dataFimPrevista: Date | null;
  dataInicioReal: Date | null;
  dataFimReal: Date | null;
  responsavelId: string | null;
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function EtapaForm({
  obraId,
  etapasParaSelecao,
  usuarios,
  etapa,
  paiIdPadrao,
}: {
  obraId: string;
  etapasParaSelecao: EtapaTreeNode[];
  usuarios: { id: string; nome: string }[];
  etapa?: EtapaInicial;
  paiIdPadrao?: string;
}) {
  const [state, action, pending] = useActionState(saveEtapa, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="obraId" value={obraId} />
      {etapa && <input type="hidden" name="etapaId" value={etapa.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-slate-700">
          Nome da etapa
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={etapa?.nome}
          placeholder="Ex: Demolição, Instalação elétrica, Montagem de armários..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.nome && (
          <p className="text-sm text-red-600">{state.errors.nome[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="paiId" className="text-sm font-medium text-slate-700">
          Etapa superior (opcional)
        </label>
        <select
          id="paiId"
          name="paiId"
          defaultValue={etapa?.paiId ?? paiIdPadrao ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Nenhuma (etapa de nível principal)</option>
          {etapasParaSelecao
            .filter((e) => e.id !== etapa?.id)
            .map((e) => (
              <option key={e.id} value={e.id}>
                {"— ".repeat(e.depth)}
                {e.nome}
              </option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={etapa?.status ?? "NAO_INICIADA"}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {STATUS_ETAPA.map((s) => (
              <option key={s} value={s}>
                {STATUS_ETAPA_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="percentualConcluido"
            className="text-sm font-medium text-slate-700"
          >
            % concluído
          </label>
          <input
            id="percentualConcluido"
            name="percentualConcluido"
            type="number"
            min={0}
            max={100}
            defaultValue={etapa?.percentualConcluido ?? 0}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="responsavelId" className="text-sm font-medium text-slate-700">
            Responsável
          </label>
          <select
            id="responsavelId"
            name="responsavelId"
            defaultValue={etapa?.responsavelId ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Sem responsável definido</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>

        <div />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dataInicioPrevista"
            className="text-sm font-medium text-slate-700"
          >
            Início previsto
          </label>
          <input
            id="dataInicioPrevista"
            name="dataInicioPrevista"
            type="date"
            defaultValue={toDateInputValue(etapa?.dataInicioPrevista ?? null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dataFimPrevista"
            className="text-sm font-medium text-slate-700"
          >
            Fim previsto
          </label>
          <input
            id="dataFimPrevista"
            name="dataFimPrevista"
            type="date"
            defaultValue={toDateInputValue(etapa?.dataFimPrevista ?? null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="dataInicioReal"
            className="text-sm font-medium text-slate-700"
          >
            Início real
          </label>
          <input
            id="dataInicioReal"
            name="dataInicioReal"
            type="date"
            defaultValue={toDateInputValue(etapa?.dataInicioReal ?? null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dataFimReal" className="text-sm font-medium text-slate-700">
            Fim real
          </label>
          <input
            id="dataFimReal"
            name="dataFimReal"
            type="date"
            defaultValue={toDateInputValue(etapa?.dataFimReal ?? null)}
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
          className="rounded-lg bg-ink-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-ink-700 disabled:opacity-60"
        >
          {pending ? "Salvando..." : etapa ? "Salvar alterações" : "Criar etapa"}
        </button>
      </div>
    </form>
  );
}
