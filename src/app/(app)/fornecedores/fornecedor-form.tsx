"use client";

import { useActionState } from "react";
import { saveFornecedor } from "@/app/actions/fornecedores";

type FornecedorInicial = {
  id: string;
  nome: string;
  cnpjCpf: string | null;
  contato: string | null;
  telefone: string | null;
  email: string | null;
  especialidade: string | null;
};

export function FornecedorForm({
  fornecedor,
}: {
  fornecedor?: FornecedorInicial;
}) {
  const [state, action, pending] = useActionState(saveFornecedor, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {fornecedor && (
        <input type="hidden" name="fornecedorId" value={fornecedor.id} />
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-slate-700">
          Nome / Razão social
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={fornecedor?.nome}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.nome && (
          <p className="text-sm text-red-600">{state.errors.nome[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cnpjCpf" className="text-sm font-medium text-slate-700">
            CNPJ/CPF
          </label>
          <input
            id="cnpjCpf"
            name="cnpjCpf"
            defaultValue={fornecedor?.cnpjCpf ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="especialidade" className="text-sm font-medium text-slate-700">
            Especialidade
          </label>
          <input
            id="especialidade"
            name="especialidade"
            placeholder="Ex: Ferragens, MDF, Vidros..."
            defaultValue={fornecedor?.especialidade ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contato" className="text-sm font-medium text-slate-700">
            Pessoa de contato
          </label>
          <input
            id="contato"
            name="contato"
            defaultValue={fornecedor?.contato ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefone" className="text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            id="telefone"
            name="telefone"
            defaultValue={fornecedor?.telefone ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={fornecedor?.email ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          {state?.errors?.email && (
            <p className="text-sm text-red-600">{state.errors.email[0]}</p>
          )}
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
          {pending
            ? "Salvando..."
            : fornecedor
              ? "Salvar alterações"
              : "Cadastrar fornecedor"}
        </button>
      </div>
    </form>
  );
}
