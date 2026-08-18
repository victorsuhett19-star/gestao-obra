"use client";

import { useActionState } from "react";
import { criarAcessoCliente } from "@/app/actions/cliente";

export function ClienteAcessoForm({
  obraId,
  nomeInicial,
  emailInicial,
  telefoneInicial,
}: {
  obraId: string;
  nomeInicial: string;
  emailInicial: string;
  telefoneInicial: string;
}) {
  const [state, action, pending] = useActionState(
    criarAcessoCliente.bind(null, obraId),
    undefined
  );

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input
        name="nome"
        defaultValue={nomeInicial}
        placeholder="Nome do cliente"
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
      />
      {state?.errors?.nome && (
        <p className="text-xs text-red-600">{state.errors.nome[0]}</p>
      )}
      <input
        name="email"
        type="email"
        defaultValue={emailInicial}
        placeholder="E-mail (login)"
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
      />
      {state?.errors?.email && (
        <p className="text-xs text-red-600">{state.errors.email[0]}</p>
      )}
      <input
        name="telefone"
        defaultValue={telefoneInicial}
        placeholder="Telefone (opcional)"
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
      />
      <input
        name="senha"
        type="text"
        placeholder="Senha (mínimo 6 caracteres)"
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
      />
      {state?.errors?.senha && (
        <p className="text-xs text-red-600">{state.errors.senha[0]}</p>
      )}
      {state?.message && <p className="text-xs text-red-600">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Criando..." : "Criar acesso do cliente"}
      </button>
      <p className="text-xs text-slate-400">
        O cliente entra em <strong>/portal</strong> com este e-mail e senha.
      </p>
    </form>
  );
}
