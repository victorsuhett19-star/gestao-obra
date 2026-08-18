"use client";

import { useActionState } from "react";
import { saveUsuario } from "@/app/actions/usuarios";
import { PAPEL_USUARIO } from "@/lib/definitions";
import { PAPEL_LABEL } from "@/lib/labels";

type UsuarioInicial = {
  id: string;
  nome: string;
  email: string;
  papel: string;
};

export function UsuarioForm({ usuario }: { usuario?: UsuarioInicial }) {
  const [state, action, pending] = useActionState(saveUsuario, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {usuario && <input type="hidden" name="usuarioId" value={usuario.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={usuario?.nome}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.nome && (
          <p className="text-sm text-red-600">{state.errors.nome[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          E-mail (usado para login)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={usuario?.email}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.email && (
          <p className="text-sm text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="papel" className="text-sm font-medium text-slate-700">
          Função
        </label>
        <select
          id="papel"
          name="papel"
          defaultValue={usuario?.papel ?? "MESTRE_OBRA"}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          {PAPEL_USUARIO.map((p) => (
            <option key={p} value={p}>
              {PAPEL_LABEL[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm font-medium text-slate-700">
          {usuario ? "Nova senha (opcional)" : "Senha"}
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          placeholder={usuario ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {state?.errors?.senha && (
          <p className="text-sm text-red-600">{state.errors.senha[0]}</p>
        )}
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
            : usuario
              ? "Salvar alterações"
              : "Criar login"}
        </button>
      </div>
    </form>
  );
}
