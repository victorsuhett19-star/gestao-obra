"use client";

import { useActionState, useState } from "react";
import { saveAtendimento } from "@/app/actions/atendimento";
import { ORIGEM_ATENDIMENTO, FAIXA_INVESTIMENTO, TRADES } from "@/lib/definitions";
import { ORIGEM_ATENDIMENTO_LABEL, FAIXA_INVESTIMENTO_LABEL, TRADE_LABEL } from "@/lib/labels";

type AtendimentoInicial = {
  id: string;
  nomeCliente: string;
  telefone: string | null;
  email: string | null;
  clienteCpfCnpj: string | null;
  ambienteDesejado: string | null;
  origem: string;
  vendedorId: string | null;
  vendedorColaboradorId: string | null;
  valorEstimado: number | null;
  faixaInvestimento: string | null;
  cor: string | null;
  especialidades: { trade: string }[];
};

const CORES = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#64748b",
];

export function AtendimentoForm({
  usuarios,
  colaboradores,
  atendimento,
}: {
  usuarios: { id: string; nome: string }[];
  colaboradores: { id: string; nome: string; funcao: string | null }[];
  atendimento?: AtendimentoInicial;
}) {
  const [state, action, pending] = useActionState(saveAtendimento, undefined);
  const [cor, setCor] = useState<string | null>(atendimento?.cor ?? null);
  const vendedorAtual = atendimento?.vendedorId
    ? `usuario:${atendimento.vendedorId}`
    : atendimento?.vendedorColaboradorId
      ? `colaborador:${atendimento.vendedorColaboradorId}`
      : "";
  const especialidadesIniciais = new Set(
    atendimento?.especialidades.map((e) => e.trade) ?? []
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      {atendimento && (
        <input type="hidden" name="atendimentoId" value={atendimento.id} />
      )}

      <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
        Preencha os dados do cliente. Depois de criado, distribua pra um
        vendedor no campo &quot;Vendedor&quot; abaixo.
      </p>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Especialidade(s)
        </label>
        <p className="text-xs text-slate-400">
          Pode marcar mais de uma — e voltar aqui pra incluir outra depois,
          se o cliente decidir fazer mais itens com a gente.
        </p>
        <div className="flex flex-wrap gap-2">
          {TRADES.map((t) => (
            <label
              key={t}
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white"
            >
              <input
                type="checkbox"
                name="especialidades"
                value={t}
                defaultChecked={especialidadesIniciais.has(t)}
                className="sr-only"
              />
              {TRADE_LABEL[t]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Tipo de atendimento
        </label>
        <div className="flex flex-wrap gap-2">
          {ORIGEM_ATENDIMENTO.map((o) => (
            <label
              key={o}
              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white"
            >
              <input
                type="radio"
                name="origem"
                value={o}
                defaultChecked={(atendimento?.origem ?? "LEAD") === o}
                className="sr-only"
              />
              {ORIGEM_ATENDIMENTO_LABEL[o]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nomeCliente" className="text-sm font-medium text-slate-700">
          Nome do cliente
        </label>
        <input
          id="nomeCliente"
          name="nomeCliente"
          defaultValue={atendimento?.nomeCliente}
          placeholder="Nome completo"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.nomeCliente && (
          <p className="text-sm text-red-600">{state.errors.nomeCliente[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefone" className="text-sm font-medium text-slate-700">
            Telefone / WhatsApp
          </label>
          <input
            id="telefone"
            name="telefone"
            placeholder="(21) 99999-0000"
            defaultValue={atendimento?.telefone ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="cliente@email.com"
            defaultValue={atendimento?.email ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.email && (
            <p className="text-sm text-red-600">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="clienteCpfCnpj" className="text-sm font-medium text-slate-700">
            CPF / CNPJ <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="clienteCpfCnpj"
            name="clienteCpfCnpj"
            placeholder="000.000.000-00"
            defaultValue={atendimento?.clienteCpfCnpj ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ambienteDesejado" className="text-sm font-medium text-slate-700">
            Ambiente desejado
          </label>
          <input
            id="ambienteDesejado"
            name="ambienteDesejado"
            placeholder="Ex: Cozinha, quarto..."
            defaultValue={atendimento?.ambienteDesejado ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="valorEstimado" className="text-sm font-medium text-slate-700">
            Valor estimado da venda (R$)
          </label>
          <input
            id="valorEstimado"
            name="valorEstimado"
            type="number"
            step="any"
            min={0}
            defaultValue={atendimento?.valorEstimado ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vendedor" className="text-sm font-medium text-slate-700">
            Vendedor
          </label>
          <select
            id="vendedor"
            name="vendedor"
            defaultValue={vendedorAtual}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Não definido</option>
            {usuarios.length > 0 && (
              <optgroup label="Usuários (com login)">
                {usuarios.map((u) => (
                  <option key={u.id} value={`usuario:${u.id}`}>
                    {u.nome}
                  </option>
                ))}
              </optgroup>
            )}
            {colaboradores.length > 0 && (
              <optgroup label="Colaboradores (equipe de campo)">
                {colaboradores.map((c) => (
                  <option key={c.id} value={`colaborador:${c.id}`}>
                    {c.nome}
                    {c.funcao ? ` — ${c.funcao}` : ""}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="faixaInvestimento" className="text-sm font-medium text-slate-700">
          Faixa de investimento
        </label>
        <select
          id="faixaInvestimento"
          name="faixaInvestimento"
          defaultValue={atendimento?.faixaInvestimento ?? ""}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Selecione...</option>
          {FAIXA_INVESTIMENTO.map((f) => (
            <option key={f} value={f}>
              {FAIXA_INVESTIMENTO_LABEL[f]}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400">
          Usado apenas pra entender a carga de trabalho e distribuir o
          atendimento — não entra no valor de venda.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Cor no quadro (opcional)</label>
        <input type="hidden" name="cor" value={cor ?? ""} />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCor(null)}
            aria-label="Sem cor"
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs text-slate-400 ${cor === null ? "border-slate-900" : "border-slate-200"}`}
          >
            ✕
          </button>
          {CORES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCor(c)}
              aria-label={`Cor ${c}`}
              className={`h-7 w-7 rounded-full border-2 ${cor === c ? "border-slate-900" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
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
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {pending
            ? "Salvando..."
            : atendimento
              ? "Salvar alterações"
              : "Criar atendimento"}
        </button>
      </div>
    </form>
  );
}
