"use client";

import { useActionState } from "react";
import { salvarTarefa } from "@/app/actions/tarefas";
import { STATUS_TAREFA, PRIORIDADE_TAREFA } from "@/lib/definitions";
import { STATUS_TAREFA_LABEL, PRIORIDADE_TAREFA_LABEL } from "@/lib/labels";

type TarefaInicial = {
  id: string;
  titulo: string;
  categoria: string | null;
  status: string;
  prioridade: string;
  responsavelId: string | null;
  dataInicio: Date | null;
  dataPrazo: Date | null;
  duracaoDias: number;
  dependeDe: { dependeDeId: string }[];
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function TarefaForm({
  obraId,
  usuarios,
  outrasTarefas,
  tarefa,
}: {
  obraId: string;
  usuarios: { id: string; nome: string }[];
  outrasTarefas: { id: string; titulo: string }[];
  tarefa?: TarefaInicial;
}) {
  const [state, action, pending] = useActionState(salvarTarefa, undefined);
  const depsIniciais = new Set(tarefa?.dependeDe.map((d) => d.dependeDeId) ?? []);
  const temDependencia = depsIniciais.size > 0;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="obraId" value={obraId} />
      {tarefa && <input type="hidden" name="tarefaId" value={tarefa.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          id="titulo"
          name="titulo"
          defaultValue={tarefa?.titulo}
          placeholder="Ex: Planta de layout — opção 02"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.titulo && (
          <p className="text-sm text-red-600">{state.errors.titulo[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={tarefa?.status ?? "A_FAZER"}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {STATUS_TAREFA.map((s) => (
              <option key={s} value={s}>
                {STATUS_TAREFA_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="prioridade" className="text-sm font-medium text-slate-700">
            Prioridade
          </label>
          <select
            id="prioridade"
            name="prioridade"
            defaultValue={tarefa?.prioridade ?? "NORMAL"}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            {PRIORIDADE_TAREFA.map((p) => (
              <option key={p} value={p}>
                {PRIORIDADE_TAREFA_LABEL[p]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria" className="text-sm font-medium text-slate-700">
            Categoria
          </label>
          <input
            id="categoria"
            name="categoria"
            defaultValue={tarefa?.categoria ?? ""}
            placeholder="Ex: Anteprojeto, Executivo..."
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
            defaultValue={tarefa?.responsavelId ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Ninguém</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dataInicio" className="text-sm font-medium text-slate-700">
            Início {temDependencia && <span className="text-slate-400">(auto)</span>}
          </label>
          <input
            id="dataInicio"
            name="dataInicio"
            type="date"
            disabled={temDependencia}
            defaultValue={tarefa?.dataInicio ? toDateInputValue(tarefa.dataInicio) : ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="duracaoDias" className="text-sm font-medium text-slate-700">
            Duração (dias)
          </label>
          <input
            id="duracaoDias"
            name="duracaoDias"
            type="number"
            min={1}
            defaultValue={tarefa?.duracaoDias ?? 1}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {!temDependencia && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dataPrazo" className="text-sm font-medium text-slate-700">
              Prazo
            </label>
            <input
              id="dataPrazo"
              name="dataPrazo"
              type="date"
              defaultValue={tarefa?.dataPrazo ? toDateInputValue(tarefa.dataPrazo) : ""}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        )}
      </div>

      {outrasTarefas.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">
            Depende de (opcional)
          </label>
          <p className="text-xs text-slate-500">
            Marcando uma ou mais, o início e o prazo desta tarefa passam a ser
            calculados automaticamente pra começar só depois que elas
            terminarem.
          </p>
          <div className="grid max-h-40 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
            {outrasTarefas.map((t) => (
              <label key={t.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="dependencias"
                  value={t.id}
                  defaultChecked={depsIniciais.has(t.id)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                {t.titulo}
              </label>
            ))}
          </div>
        </div>
      )}

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
          {pending ? "Salvando..." : tarefa ? "Salvar alterações" : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
}
